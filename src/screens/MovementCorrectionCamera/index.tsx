// import { RNMediapipe } from '@thinksys/react-native-mediapipe'
import { useCallback, useEffect, useRef } from "react"
import { Platform } from "react-native"
import WebView, { WebViewMessageEvent } from 'react-native-webview'
import NoPermission from "../../components/NoPermission"
import Wrapper from '../../components/Wrapper'
import { goBack } from '../../utils/navigation'
import useMovementCorrectionCameraController from "./useMovementCorrectionCameraController"

/**
 * iOS-only camera aspect-ratio / stretch fix for the movement-correction
 * WebView (remote MediaPipe page). Android renders correctly, so nothing
 * here runs on Android.
 *
 * Why it distorts on iOS:
 *   The remote page draws each camera frame into a <canvas> whose *bitmap*
 *   size equals the (landscape) camera resolution, then CSS-sizes that
 *   canvas to width:100% / height:100% of a portrait container. A landscape
 *   bitmap forced into a portrait box = NON-UNIFORM stretch = the user's
 *   body shape is distorted, which is what wrecks landmark accuracy.
 *
 * Why earlier fixes were flaky:
 *   They sized the CSS box from a single aspect value (e.g. getUserMedia
 *   track settings). On iOS that value can disagree with the actual canvas
 *   bitmap dimensions. Whenever the box aspect != the content aspect, the
 *   distortion comes right back — intermittently, exactly as reported.
 *
 * The correct, timing-independent rule:
 *   Size EACH element to ITS OWN intrinsic content aspect —
 *     <video>  -> videoWidth / videoHeight
 *     <canvas> -> canvas.width / canvas.height   (the exact drawn buffer)
 *   Matching an element's CSS box to its own buffer aspect can never
 *   distort it (worst case is a different crop amount, never a squish), and
 *   `object-fit: cover` is kept as a second safety net. We never force
 *   getUserMedia constraints (doing so makes iOS digitally crop/zoom the
 *   real sensor image).
 */
const IOS_CAMERA_FIX_SCRIPT = `
(function () {
  if (window.__ygCamFix) {
    if (typeof window.__ygCamFixRun === 'function') window.__ygCamFixRun();
    true;
    return;
  }
  window.__ygCamFix = true;

  // Remember the stream so we can fully release it on stop (the remote page
  // never calls track.stop()). Never touch constraints (forcing them makes
  // iOS crop/zoom the sensor).
  try {
    var md = navigator.mediaDevices;
    if (md && typeof md.getUserMedia === 'function' && !md.__ygWrapped) {
      var original = md.getUserMedia.bind(md);
      md.getUserMedia = function (c) {
        return original(c).then(function (stream) {
          try { window.__ygStream = stream; } catch (e) {}
          return stream;
        });
      };
      md.__ygWrapped = true;
    }
  } catch (e) {}

  // THE core fix. The remote page repaints every camera frame onto the pose
  // canvas via drawImage(video, 0,0, canvas.width, canvas.height), where the
  // canvas buffer = video.videoWidth/videoHeight. On iOS those values are
  // unreliable (esp. on a warm 2nd-open camera), so the frame gets baked into
  // the canvas at a wrong aspect = permanent stretch that no CSS can undo.
  //
  // Instead, block bitmap painting on the pose canvas so it stays a
  // transparent skeleton-only overlay, and let the native <video> element
  // (which renders the true camera frame regardless of videoWidth) show the
  // camera underneath. Vector skeleton ops (lineTo/arc/stroke/fill) are
  // untouched, so landmarks still draw.
  try {
    var proto = window.CanvasRenderingContext2D && CanvasRenderingContext2D.prototype;
    if (proto && !proto.__ygDrawPatched) {
      var origDrawImage = proto.drawImage;
      proto.drawImage = function () {
        try {
          if (this.canvas && this.canvas.id === 'pose-canvas') return;
        } catch (e) {}
        return origDrawImage.apply(this, arguments);
      };
      proto.__ygDrawPatched = true;
    }
  } catch (e) {}

  window.__ygStopCamera = function () {
    try {
      if (window.__ygStream) {
        window.__ygStream.getTracks().forEach(function (t) { try { t.stop(); } catch (e) {} });
        window.__ygStream = null;
      }
    } catch (e) {}
  };

  function lockViewport() {
    var content = 'width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no, viewport-fit=cover';
    var meta = document.querySelector('meta[name="viewport"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'viewport';
      (document.head || document.documentElement).appendChild(meta);
    }
    meta.setAttribute('content', content);
  }

  function ensureStyle() {
    if (document.getElementById('yg-cam-fix-style')) return;
    var style = document.createElement('style');
    style.id = 'yg-cam-fix-style';
    style.textContent = [
      'html, body {',
      '  margin: 0 !important;',
      '  padding: 0 !important;',
      '  width: 100% !important;',
      '  height: 100% !important;',
      '  overflow: hidden !important;',
      '}',
      '.container, #exercise-view, #exercise-view.active, .exercise-container, .video-feed, .video-placeholder {',
      '  position: absolute !important;',
      '  inset: 0 !important;',
      '  width: 100% !important;',
      '  height: 100% !important;',
      '  max-width: 100% !important;',
      '  max-height: 100% !important;',
      '  margin: 0 !important;',
      '  padding: 0 !important;',
      '  overflow: hidden !important;',
      '  box-sizing: border-box !important;',
      '}',
      // Native <video> shows the real camera (immune to videoWidth misreport).
      '#camera-stream {',
      '  display: block !important;',
      '  visibility: visible !important;',
      '  opacity: 1 !important;',
      '  object-fit: cover !important;',
      '  z-index: 1 !important;',
      '}',
      // Pose canvas is a transparent skeleton overlay on top of the video.
      '#pose-canvas {',
      '  background: transparent !important;',
      '  z-index: 2 !important;',
      '}',
    ].join('\\n');
    (document.head || document.documentElement).appendChild(style);
  }

  // Each element's own buffer aspect (what is actually drawn). Matching a
  // box to its own buffer aspect can never squish it. Returns 0 if unknown.
  function intrinsicAspect(el) {
    if (!el) return 0;
    if (el.tagName === 'VIDEO') {
      if (el.videoWidth > 0 && el.videoHeight > 0) return el.videoWidth / el.videoHeight;
      return 0;
    }
    if (el.tagName === 'CANVAS') {
      if (el.width > 0 && el.height > 0) return el.width / el.height;
      return 0;
    }
    return 0;
  }

  // Size the <video> box to its own content aspect and let object-fit:cover
  // fill it (reliable for <video> on iOS). Overflow is clipped by the parent.
  function forceCover(el) {
    if (!el) return;
    var parent = el.parentElement || document.body;
    var pw = parent.clientWidth || window.innerWidth;
    var ph = parent.clientHeight || window.innerHeight;
    if (!pw || !ph) return;

    el.style.setProperty('position', 'absolute', 'important');
    el.style.setProperty('top', '50%', 'important');
    el.style.setProperty('left', '50%', 'important');
    el.style.setProperty('right', 'auto', 'important');
    el.style.setProperty('bottom', 'auto', 'important');
    el.style.setProperty('margin', '0', 'important');
    el.style.setProperty('max-width', 'none', 'important');
    el.style.setProperty('max-height', 'none', 'important');
    el.style.setProperty('min-width', '0', 'important');
    el.style.setProperty('min-height', '0', 'important');
    el.style.setProperty('object-fit', 'cover', 'important');
    el.style.setProperty('transform', 'translate(-50%, -50%) scaleX(-1)', 'important');

    var aspect = intrinsicAspect(el);
    if (!aspect) {
      el.style.setProperty('width', '100%', 'important');
      el.style.setProperty('height', '100%', 'important');
      return;
    }

    var parentAspect = pw / ph;
    var w, h;
    if (parentAspect > aspect) { w = pw; h = pw / aspect; }
    else { h = ph; w = ph * aspect; }
    el.style.setProperty('width', Math.round(w) + 'px', 'important');
    el.style.setProperty('height', Math.round(h) + 'px', 'important');
  }

  // The skeleton canvas must sit EXACTLY on top of where the <video> actually
  // renders the camera. Instead of computing the canvas layout independently
  // (which drifts from the video's object-fit:cover on iOS and pushes the
  // joints off the body), we tie the canvas to the video's real on-screen
  // rectangle: read the video's rect, compute the same cover-content box the
  // video shows, and pin the canvas to that exact viewport rect. The canvas
  // bitmap (poseCanvas.width/height = video frame size) then maps 1:1 onto the
  // camera, so landmarks land on the body — identical to Android.
  function alignCanvasToVideo() {
    var v = document.getElementById('camera-stream');
    var c = document.getElementById('pose-canvas');
    if (!v || !c) return;
    var vw = v.videoWidth, vh = v.videoHeight;
    if (!vw || !vh) return;
    var r = v.getBoundingClientRect();
    if (!r.width || !r.height) return;

    // object-fit:cover content box within the video's rect.
    var scale = Math.max(r.width / vw, r.height / vh);
    var cw = vw * scale;
    var ch = vh * scale;
    var cx = r.left + (r.width - cw) / 2;
    var cy = r.top + (r.height - ch) / 2;

    c.style.setProperty('position', 'fixed', 'important');
    c.style.setProperty('left', cx + 'px', 'important');
    c.style.setProperty('top', cy + 'px', 'important');
    c.style.setProperty('right', 'auto', 'important');
    c.style.setProperty('bottom', 'auto', 'important');
    c.style.setProperty('width', cw + 'px', 'important');
    c.style.setProperty('height', ch + 'px', 'important');
    c.style.setProperty('margin', '0', 'important');
    c.style.setProperty('max-width', 'none', 'important');
    c.style.setProperty('max-height', 'none', 'important');
    c.style.setProperty('min-width', '0', 'important');
    c.style.setProperty('min-height', '0', 'important');
    // Box already matches the bitmap aspect -> fill = no distortion, and it
    // avoids iOS's buggy object-fit:cover on <canvas>.
    c.style.setProperty('object-fit', 'fill', 'important');
    // Mirror around the canvas center (same pivot as the video) to match the
    // front-camera flip.
    c.style.setProperty('transform', 'scaleX(-1)', 'important');
    c.style.setProperty('z-index', '2', 'important');
  }

  function run() {
    try {
      lockViewport();
      ensureStyle();
      forceCover(document.getElementById('camera-stream'));
      alignCanvasToVideo();
    } catch (e) {}
  }
  window.__ygCamFixRun = run;

  // Tight loop for the warm-up window (camera + first pose results), then a
  // lighter backstop (observer + interval) for the rest of the session.
  var deadline = Date.now() + 20000;
  function rafLoop() {
    run();
    if (Date.now() < deadline) requestAnimationFrame(rafLoop);
  }
  requestAnimationFrame(rafLoop);

  try {
    var observer = new MutationObserver(function () { run(); });
    observer.observe(document.documentElement || document.body, {
      childList: true, subtree: true, attributes: true,
      attributeFilter: ['style', 'width', 'height', 'class'],
    });
  } catch (e) {}
  setInterval(run, 500);

  document.addEventListener('DOMContentLoaded', run);
  window.addEventListener('resize', run);
  window.addEventListener('orientationchange', run);
  window.addEventListener('pageshow', run);
  window.addEventListener('pagehide', window.__ygStopCamera);

  run();
  true;
})();
`

const IOS_STOP_CAMERA_SCRIPT = `
(function () { if (typeof window.__ygStopCamera === 'function') window.__ygStopCamera(); true; })();
`

const MovementCorrectionCamera = () => {

    const isIOS = Platform.OS === "ios"
    const webViewRef = useRef<WebView>(null)

    const {
        values: {
            permission_granted,
            checking,
            exerciseKey,
            session_id,
            mode,
            selected_side,
        },
    } = useMovementCorrectionCameraController()

    const stopCamera = useCallback(() => {
        if (!isIOS) return
        webViewRef.current?.injectJavaScript(IOS_STOP_CAMERA_SCRIPT)
    }, [isIOS])

    // Release the camera when leaving so the next session starts clean.
    useEffect(() => {
        return () => {
            stopCamera()
        }
    }, [stopCamera])

    const onMessage = useCallback((event: WebViewMessageEvent) => {
        try {
            const data = JSON.parse(event?.nativeEvent?.data)
            if (data?.event === "stop_exercise") {
                stopCamera()
                goBack()
            }
        } catch {
            // Ignore non-JSON messages
        }
    }, [stopCamera])

    const onLoadEnd = useCallback(() => {
        if (!isIOS) return
        webViewRef.current?.injectJavaScript(IOS_CAMERA_FIX_SCRIPT)
    }, [isIOS])

    if (checking) return null

    if (!permission_granted) {
        return <NoPermission message={"Camera Permission is required"} />
    }

    const queryParts = [
        `session_id=${encodeURIComponent(String(session_id ?? ''))}`,
        `exercise=${encodeURIComponent(String(exerciseKey || ''))}`,
    ]
    if (mode) {
        queryParts.push(`mode=${encodeURIComponent(String(mode))}`)
    }
    if (selected_side) {
        queryParts.push(
            `selected_side=${encodeURIComponent(String(selected_side))}`,
        )
    }

    return (
        <Wrapper no_padding>
            <WebView
                ref={webViewRef}
                source={{
                    uri: `https://yalla-movement-correction-file.vercel.app/?${queryParts.join('&')}`,
                }}
                style={{ flex: 1, backgroundColor: "transparent" }}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                allowsInlineMediaPlayback={true}
                mediaPlaybackRequiresUserAction={false}
                allowFileAccess={true}
                originWhitelist={['*']}
                onMessage={onMessage}
                mediaCapturePermissionGrantType="grantIfSameHostElsePrompt"
                {...(isIOS
                    ? {
                          scrollEnabled: false,
                          bounces: false,
                          contentInsetAdjustmentBehavior: "never" as const,
                          injectedJavaScriptBeforeContentLoaded: IOS_CAMERA_FIX_SCRIPT,
                          injectedJavaScript: IOS_CAMERA_FIX_SCRIPT,
                          onLoadEnd,
                      }
                    : {})}
            />
        </Wrapper>
    )
}

export default MovementCorrectionCamera
