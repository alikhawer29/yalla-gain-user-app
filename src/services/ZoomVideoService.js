/**
 * Zoom Video SDK service (wraps @zoom/react-native-videosdk useZoom instance).
 *
 * Note: Official npm package is `@zoom/react-native-videosdk` (not @zoom/videosdk-react-native).
 * Call ZoomVideoService.attach(zoom) from VideoSessionScreen after useZoom() is available.
 */

import { NativeModules, Platform } from 'react-native';
import Sound from 'react-native-sound';
import {
  forceAndroidEarpieceRoute,
  isAndroidSpeakerphoneOn,
  setAndroidSpeakerphoneOn,
} from '../utils/androidAudioRoute';

const { RNZoomVideoSdk, RNZoomVideoSdkVideoHelper } = NativeModules;

const SESSION_IDLE_TIMEOUT_MINS = 40;

class ZoomVideoServiceClass {
  /** @type {import('@zoom/react-native-videosdk').ZoomVideoSdkContext | null} */
  _zoom = null;

  /** @type {string | null} */
  _sessionToken = null;

  /** @type {string | null} */
  _myUserId = null;

  /** @type {boolean} */
  _isVideoOn = true;

  /** @type {boolean} */
  _isAudioOn = true;

  /** @type {boolean} */
  _isSpeakerOn = true;

  /** @type {boolean} */
  _isBackCamera = false;

  /** @type {string | null} */
  _frontDeviceId = null;

  /** @type {string | null} */
  _backDeviceId = null;

  /** @type {boolean | null} */
  _lastMirrorEnabled = null;

  /** @type {ReturnType<typeof setTimeout>[]} */
  _rotationLockTimers = [];

  /** @type {boolean} */
  _releaseInProgress = false;

  /** @type {boolean} */
  _intentionalLeave = false;

  markIntentionalLeave() {
    this._intentionalLeave = true;
  }

  isIntentionalLeave() {
    return this._intentionalLeave;
  }

  _clearRotationLockTimers() {
    this._rotationLockTimers.forEach(id => clearTimeout(id));
    this._rotationLockTimers = [];
  }

  /**
   * Bind the hook instance from ZoomVideoSdkProvider tree.
   * @param {import('@zoom/react-native-videosdk').ZoomVideoSdkContext} zoomInstance
   */
  attach(zoomInstance) {
    this._zoom = zoomInstance;
    this._releaseInProgress = false;
    console.log('[ZoomVideoService] SDK instance attached');
  }

  /** Detach on screen unmount. */
  detach() {
    this._clearRotationLockTimers();
    this._zoom = null;
    this._sessionToken = null;
    this._myUserId = null;
    this._frontDeviceId = null;
    this._backDeviceId = null;
    this._lastMirrorEnabled = null;
    this._intentionalLeave = false;
    this._isSpeakerOn = true;
    console.log('[ZoomVideoService] SDK instance detached');
  }

  /**
   * Leave an active native session without calling cleanup().
   * cleanup() tears down initSdk state and breaks the next join.
   */
  async releaseActiveSession() {
    const zoom = this._zoom;
    if (!zoom) return;

    this._clearRotationLockTimers();

    try {
      let inSession = false;
      try {
        inSession = await zoom.isInSession();
      } catch (e) {
        console.log('[ZoomVideoService] releaseActiveSession isInSession', e);
      }

      if (!inSession) {
        return;
      }

      console.log('[ZoomVideoService] Leaving stale native session');
      try {
        await zoom.videoHelper.stopVideo();
      } catch (e) {
        console.log('[ZoomVideoService] stopVideo on release', e);
      }
      try {
        zoom.leaveSession(false);
      } catch (e) {
        console.log('[ZoomVideoService] leaveSession on release', e);
      }

      await new Promise(resolve => setTimeout(resolve, 600));
    } catch (e) {
      console.log('[ZoomVideoService] releaseActiveSession', e);
    }

    this._myUserId = null;
    this._isVideoOn = true;
    this._isAudioOn = true;
    this._isSpeakerOn = true;
    this._isBackCamera = false;
    this._frontDeviceId = null;
    this._backDeviceId = null;
    this._lastMirrorEnabled = null;
    this._releaseInProgress = false;
  }

  /** Best-effort leave on unmount — never call cleanup() here. */
  releaseActiveSessionSync() {
    if (this._releaseInProgress) {
      return;
    }
    this._releaseInProgress = true;
    this._clearRotationLockTimers();

    try {
      RNZoomVideoSdkVideoHelper?.stopVideo?.();
    } catch (e) {
      console.log('[ZoomVideoService] native stopVideo', e);
    }

    try {
      RNZoomVideoSdk?.leaveSession?.(false);
    } catch (e) {
      console.log('[ZoomVideoService] native leaveSession', e);
    }

    const zoom = this._zoom;
    if (zoom) {
      try {
        zoom.leaveSession(false);
      } catch (e) {
        console.log('[ZoomVideoService] sync leaveSession', e);
      }
    }

    this._myUserId = null;
    console.log('[ZoomVideoService] releaseActiveSessionSync done');
    this._releaseInProgress = false;
  }

  _cameraLabel(camera) {
    // Only use device name for detection, not the ID (IDs like "1" can confuse regex)
    return (camera?.deviceName || '').toLowerCase();
  }

  /** Best-effort facing from SDK labels (often generic on Android). */
  _facingFromLabel(label) {
    // Check for "front" first (more specific)
    if (/front|user|selfie|face|facing.*front/.test(label)) {
      return 'front';
    }
    // Then check for "back"
    if (/back|rear|environment|facing.*back/.test(label)) {
      return 'back';
    }
    return null;
  }

  _seedFacingMap(cameras, selected) {
    if (!cameras?.length || !selected?.deviceId) return;

    // Only seed once - don't override learned mappings
    if (this._frontDeviceId && this._backDeviceId) {
      console.log('[ZoomVideoService] Camera IDs already learned, skipping seed');
      return;
    }

    console.log('[ZoomVideoService] Seeding camera map from labels');
    for (const cam of cameras) {
      const label = this._cameraLabel(cam);
      const facing = this._facingFromLabel(label);
      console.log('[ZoomVideoService] Camera:', cam.deviceId, label, '-> facing:', facing);
      if (facing === 'front' && !this._frontDeviceId) {
        this._frontDeviceId = cam.deviceId;
        console.log('[ZoomVideoService] Set front camera ID to:', cam.deviceId);
      }
      if (facing === 'back' && !this._backDeviceId) {
        this._backDeviceId = cam.deviceId;
        console.log('[ZoomVideoService] Set back camera ID to:', cam.deviceId);
      }
    }

    // Only use fallback if we couldn't determine from labels
    if (!this._frontDeviceId && !this._backDeviceId && cameras.length >= 2) {
      console.log('[ZoomVideoService] Could not determine from labels, using fallback: assuming selected is front');
      this._frontDeviceId = selected.deviceId;
      const other = cameras.find(c => c.deviceId !== selected.deviceId);
      if (other?.deviceId) {
        this._backDeviceId = other.deviceId;
      }
    } else if (this._frontDeviceId && !this._backDeviceId) {
      const other = cameras.find(c => c.deviceId !== this._frontDeviceId);
      if (other?.deviceId) {
        this._backDeviceId = other.deviceId;
        console.log('[ZoomVideoService] Set back camera ID (by elimination) to:', other.deviceId);
      }
    } else if (this._backDeviceId && !this._frontDeviceId) {
      const other = cameras.find(c => c.deviceId !== this._backDeviceId);
      if (other?.deviceId) {
        this._frontDeviceId = other.deviceId;
        console.log('[ZoomVideoService] Set front camera ID (by elimination) to:', other.deviceId);
      }
    }
  }

  _learnFacingFromSwitch(previousId, newId, preferBack) {
    if (!previousId || !newId || previousId === newId) return;
    if (preferBack) {
      this._backDeviceId = newId;
      this._frontDeviceId = previousId;
    } else {
      this._frontDeviceId = newId;
      this._backDeviceId = previousId;
    }
  }

  _isDeviceBack(cameras, device) {
    if (!device?.deviceId) return this._isBackCamera;

    if (this._backDeviceId && device.deviceId === this._backDeviceId) {
      return true;
    }
    if (this._frontDeviceId && device.deviceId === this._frontDeviceId) {
      return false;
    }

    const facing = this._facingFromLabel(this._cameraLabel(device));
    if (facing === 'back') return true;
    if (facing === 'front') return false;

    if (cameras?.length > 1) {
      const idx = cameras.findIndex(c => c.deviceId === device.deviceId);
      return idx === cameras.length - 1;
    }
    return false;
  }

  async _getCameraList() {
    const zoom = this._requireZoom();
    return (await zoom.videoHelper.getCameraList()) || [];
  }

  _getSelectedCamera(cameras) {
    return cameras.find(c => c.isSelectedDevice) ?? cameras[0] ?? null;
  }

  _isZoomSuccess(result) {
    if (result == null) return true;
    if (typeof result === 'boolean') return result;
    const value = String(result);
    return value.includes('Success');
  }

  async _readSpeakerStatus() {
    if (Platform.OS === 'android') {
      const androidStatus = await isAndroidSpeakerphoneOn();
      if (androidStatus != null) {
        return androidStatus;
      }
    }

    try {
      const zoom = this._requireZoom();
      const status = await zoom.audioHelper.getSpeakerStatus();
      return status === true;
    } catch (e) {
      console.log('[ZoomVideoService] getSpeakerStatus', e);
      return this._isSpeakerOn;
    }
  }

  async _applyAndroidSpeakerRoute(target) {
    await setAndroidSpeakerphoneOn(target);

    let actual = await this._readSpeakerStatus();

    if (target === false && actual === true) {
      const forced = await forceAndroidEarpieceRoute();
      if (forced != null) {
        actual = forced;
      } else {
        actual = await this._readSpeakerStatus();
      }
    }

    try {
      const zoom = this._requireZoom();
      const result = await zoom.audioHelper.setSpeaker(target);
      if (!this._isZoomSuccess(result)) {
        console.log(
          '[ZoomVideoService] Zoom setSpeaker returned',
          result,
          'target',
          target,
        );
      }
    } catch (e) {
      console.log('[ZoomVideoService] Zoom setSpeaker error', e);
    }

    return this._readSpeakerStatus();
  }

  async _callSetSpeaker(target) {
    if (Platform.OS === 'android') {
      return this._applyAndroidSpeakerRoute(target);
    }

    const zoom = this._requireZoom();
    const result = await zoom.audioHelper.setSpeaker(target);

    if (!this._isZoomSuccess(result)) {
      console.log(
        '[ZoomVideoService] setSpeaker returned',
        result,
        'target',
        target,
      );
    }
  }

  /**
   * Apply speakerphone vs earpiece and sync cached/UI state with native SDK.
   * Android may need retries until audio routing is fully initialized.
   */
  async _applySpeakerRoute(enabled) {
    const target = Boolean(enabled);

    if (Platform.OS === 'ios') {
      return this._applyIosSpeakerRoute(target);
    }

    try {
      const zoom = this._requireZoom();
      const canSwitch = await zoom.audioHelper.canSwitchSpeaker();
      if (canSwitch === false) {
        console.log(
          '[ZoomVideoService] Speaker routing locked by connected audio device',
        );
        this._isSpeakerOn = await this._readSpeakerStatus();
        return this._isSpeakerOn;
      }
    } catch (e) {
      console.log('[ZoomVideoService] canSwitchSpeaker', e);
    }

    const retryDelaysMs = [0, 300, 700, 1200];
    let actual = this._isSpeakerOn;

    for (const delayMs of retryDelaysMs) {
      if (delayMs > 0) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }

      try {
        await this._callSetSpeaker(target);
      } catch (e) {
        console.log('[ZoomVideoService] setSpeaker error', e);
      }

      actual = await this._readSpeakerStatus();
      if (actual === target) {
        break;
      }
    }

    this._isSpeakerOn = actual;
    console.log(
      '[ZoomVideoService] Speaker',
      this._isSpeakerOn ? 'ON' : 'OFF',
      '(requested',
      target ? 'ON' : 'OFF',
      ')',
    );
    return this._isSpeakerOn;
  }

  /**
   * iOS: "Speaker" acts as a full audio ON/OFF (mute everyone you hear).
   * Zoom Video SDK has no local-only "mute incoming" API and non-hosts cannot mute
   * others, so the only reliable way to silence the call is to disconnect from the
   * audio session (stopAudio) and reconnect (startAudio). We restore the mic mute
   * state on reconnect so the separate Mute button stays consistent.
   */
  async _applyIosSpeakerRoute(target) {
    const zoom = this._requireZoom();

    try {
      if (target) {
        try {
          await zoom.audioHelper.setSDKAudioSessionEnv();
        } catch (e) {
          console.log('[ZoomVideoService] iOS setSDKAudioSessionEnv', e);
        }
        await zoom.audioHelper.startAudio();
        // Native patched setSpeaker applies PlayAndRecord (mic-capable) routing.
        try {
          await zoom.audioHelper.setSpeaker(true);
        } catch (e) {
          console.log('[ZoomVideoService] iOS native setSpeaker', e);
        }

        // startAudio reconnects unmuted — restore the user's mic choice.
        if (!this._isAudioOn) {
          try {
            const myId = await this.resolveMyUserId();
            if (myId) {
              await zoom.audioHelper.muteAudio(myId);
            }
          } catch (e) {
            console.log('[ZoomVideoService] iOS restore mic mute', e);
          }
        }
      } else {
        await zoom.audioHelper.stopAudio();
      }
    } catch (e) {
      console.log('[ZoomVideoService] iOS audio toggle error', e);
    }

    this._isSpeakerOn = target;
    console.log(
      '[ZoomVideoService] Speaker (audio)',
      this._isSpeakerOn ? 'ON' : 'OFF',
      '(requested',
      target ? 'ON' : 'OFF',
      ')',
    );
    return this._isSpeakerOn;
  }

  /** Read native speaker route and update cached state. */
  async syncSpeakerState() {
    if (!this._zoom) {
      return this._isSpeakerOn;
    }

    // iOS: the route read is racy while Zoom configures its audio unit, so it can
    // briefly report speaker even right after we forced earpiece. Trust our cached
    // preference (set by the user toggle / join default) instead of the live read.
    if (Platform.OS === 'ios') {
      return this._isSpeakerOn;
    }

    try {
      const inSession = await this._zoom.isInSession();
      if (!inSession) {
        return this._isSpeakerOn;
      }
    } catch {
      return this._isSpeakerOn;
    }

    this._isSpeakerOn = await this._readSpeakerStatus();
    return this._isSpeakerOn;
  }

  /** Re-apply current speaker preference after local audio connects (Android). */
  async refreshSpeakerAfterAudioConnect() {
    // iOS: speaker is a full audio on/off (stopAudio/startAudio). Re-applying on
    // every audio-status change would fight the user's toggle, so just keep cache.
    if (Platform.OS === 'ios') {
      return this._isSpeakerOn;
    }
    return this._applySpeakerRoute(this._isSpeakerOn);
  }

  /** Cached local user id (sync). Prefer resolveMyUserId() when it may still be unset. */
  getMyUserId() {
    return this._myUserId;
  }

  async resolveMyUserId() {
    if (this._myUserId) {
      return this._myUserId;
    }
    const zoom = this._requireZoom();
    const myself = await zoom.session.getMySelf();
    this._myUserId = myself?.userId ?? null;
    return this._myUserId;
  }

  /**
   * Switch iOS to PlayAndRecord + VideoChat so Zoom can capture the mic.
   * A leftover Playback category (Spotify / launch audio) silently blocks input.
   */
  _prepareIosMicSession() {
    if (Platform.OS !== 'ios') {
      return;
    }
    try {
      Sound.setCategory('PlayAndRecord', false);
      Sound.setMode('VideoChat');
      Sound.setActive(true);
    } catch (e) {
      console.log('[ZoomVideoService] prepareIosMicSession', e);
    }
  }

  /**
   * Ensure VOIP audio is running and iOS AVAudioSession is Zoom's PlayAndRecord env.
   * Mirrors doctor app configureSessionAudio — required because App launch must not
   * leave the session stuck in a playback-only category.
   */
  async ensureSessionAudio() {
    const zoom = this._requireZoom();
    const { audioHelper } = zoom;
    if (!audioHelper) {
      return;
    }

    this._prepareIosMicSession();

    if (Platform.OS === 'ios') {
      try {
        // Prefer reset + SDK env so a prior Playback category cannot stick.
        try {
          await audioHelper.resetAudioSession();
        } catch (e) {
          console.log('[ZoomVideoService] resetAudioSession', e);
        }
        await audioHelper.setSDKAudioSessionEnv();
      } catch (e) {
        console.log('[ZoomVideoService] setSDKAudioSessionEnv', e);
      }
    }

    try {
      await audioHelper.startAudio();
    } catch (e) {
      console.log('[ZoomVideoService] startAudio', e);
    }

    // Native setSpeaker applies PlayAndRecord routing. Do not use
    // _applyIosSpeakerRoute here — that maps speaker to stopAudio/startAudio.
    if (Platform.OS === 'ios') {
      try {
        await audioHelper.setSpeaker(true);
        this._isSpeakerOn = true;
      } catch (e) {
        console.log('[ZoomVideoService] native setSpeaker', e);
      }
    }

    try {
      const myId = await this.resolveMyUserId();
      if (myId && this._isAudioOn) {
        await audioHelper.unmuteAudio(myId);
      } else if (myId && !this._isAudioOn) {
        await audioHelper.muteAudio(myId);
      }
    } catch (e) {
      console.log('[ZoomVideoService] mute/unmute after startAudio', e);
    }
  }

  _requireZoom() {
    if (!this._zoom) {
      throw new Error(
        'Zoom Video SDK is not ready. Open VideoSessionScreen inside ZoomVideoSdkProvider.',
      );
    }
    return this._zoom;
  }

  /**
   * Store JWT before join. Native SDK is initialized by ZoomVideoSdkProvider.
   * @param {string} sessionToken
   */
  async initializeSDK(sessionToken) {
    if (!sessionToken?.trim()) {
      throw new Error('session_token is required');
    }
    this._sessionToken = sessionToken.trim();
    console.log('[ZoomVideoService] Session token stored for join');
    return true;
  }

  /**
   * Join a Video SDK session.
   * @param {{ sessionName: string, userName: string, sessionToken?: string, sessionPassword?: string }} params
   */
  async joinSession({ sessionName, userName, sessionToken, sessionPassword = '' }) {
    const zoom = this._requireZoom();
    const token = (sessionToken || this._sessionToken || '').trim();
    if (!token) {
      throw new Error('session_token is required to join');
    }
    if (!sessionName?.trim()) {
      throw new Error('session_name is required to join');
    }
    if (!userName?.trim()) {
      throw new Error('user_name is required to join');
    }

    console.log('[ZoomVideoService] Joining session', sessionName);
    this._prepareIosMicSession();

    const session = await zoom.joinSession({
      sessionName: sessionName.trim(),
      sessionPassword,
      token,
      userName: userName.trim(),
      audioOptions: {
        connect: true,
        mute: false,
        autoAdjustSpeakerVolume: true,
      },
      videoOptions: {
        localVideoOn: true,
      },
      sessionIdleTimeoutMins: SESSION_IDLE_TIMEOUT_MINS,
    });

    // Video rotation/mirror is applied in prepareLocalVideo() after onSessionJoin.
    this._isVideoOn = true;
    this._isAudioOn = true;
    this._isBackCamera = false;

    return session;
  }

  /**
   * Start local camera and apply portrait settings once the session is active.
   * Must run after onSessionJoin — calling rotate/startVideo before that breaks the PiP feed.
   */
  async prepareLocalVideo() {
    const zoom = this._requireZoom();
    let isOn = false;

    try {
      const myself = await zoom.session.getMySelf();
      if (myself?.userId != null) {
        this._myUserId = myself.userId;
      }
      isOn = (await myself?.videoStatus?.isOn?.()) === true;
    } catch (e) {
      console.log('[ZoomVideoService] prepareLocalVideo status', e);
    }

    try {
      if (!isOn) {
        await zoom.videoHelper.startVideo();
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      this._isVideoOn = true;
      await this.applyPortraitVideoSettings(false, true);
      await this.ensureSessionAudio();
      await this.syncSpeakerState();
      if (Platform.OS === 'ios') {
        // iOS: "Speaker" is a full audio on/off. Default to ON so the user can hear
        // the call; ensureSessionAudio already started VOIP + SDK audio env.
        this._isSpeakerOn = true;
      } else {
        await this._applySpeakerRoute(this._isSpeakerOn);
      }
      console.log('[ZoomVideoService] Local video prepared');
    } catch (e) {
      console.log('[ZoomVideoService] prepareLocalVideo', e);
    }

    return {
      userId: this._myUserId != null ? String(this._myUserId) : null,
      isVideoOn: this._isVideoOn,
    };
  }

  /**
   * Poll until native session is active (join is async).
   * @param {number} timeoutMs
   */
  async waitUntilInSession(timeoutMs = 20000) {
    const zoom = this._requireZoom();
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      try {
        if (await zoom.isInSession()) {
          return true;
        }
      } catch (e) {
        console.log('[ZoomVideoService] isInSession poll', e);
      }
      await new Promise(resolve => setTimeout(resolve, 250));
    }
    try {
      return await zoom.isInSession();
    } catch {
      return false;
    }
  }

  /**
   * Leave or end session.
   * @param {boolean} isHost — true ends session for everyone
   */
  leaveSession(isHost = false) {
    const zoom = this._requireZoom();
    console.log('[ZoomVideoService] leaveSession', { isHost });
    zoom.leaveSession(Boolean(isHost));
    this._myUserId = null;
  }

  /** Cleanup native SDK resources. */
  cleanup() {
    try {
      const zoom = this._zoom;
      if (zoom?.cleanup) {
        zoom.cleanup();
        console.log('[ZoomVideoService] cleanup() called');
      }
    } catch (e) {
      console.log('[ZoomVideoService] cleanup error', e);
    }
    this.detach();
  }

  /**
   * Portrait app: apply rotation lock and mirroring for the active camera.
   * @param {boolean} isBackCamera
   * @param {boolean} forceLockRotation - Force rotation lock (used after camera switches)
   */
  async applyPortraitVideoSettings(isBackCamera, forceLockRotation = false) {
    const zoom = this._requireZoom();
    const shouldMirror = !isBackCamera;

    try {
      // Force rotation lock after camera switches to prevent SDK auto-rotation
      if (forceLockRotation) {
        await zoom.videoHelper.rotateMyVideo(0);
        console.log('[ZoomVideoService] Force-locked rotation to portrait (0)');
        
        // Apply rotation lock multiple times to override SDK's orientation listener
        // The SDK appears to have a delayed orientation listener that kicks in ~1 second
        this._clearRotationLockTimers();
        const reapplyTimes = [800, 1400, 2000];
        reapplyTimes.forEach(delayMs => {
          const timerId = setTimeout(async () => {
            if (!this._zoom) return;
            try {
              await zoom.videoHelper.rotateMyVideo(0);
              console.log(`[ZoomVideoService] Re-applied rotation lock after ${delayMs}ms`);
            } catch {
              // zoom may be detached after reload/unmount
            }
          }, delayMs);
          this._rotationLockTimers.push(timerId);
        });
      }
      
      // Apply mirroring based on camera
      if (this._lastMirrorEnabled !== shouldMirror) {
        await zoom.videoHelper.mirrorMyVideo(shouldMirror);
        this._lastMirrorEnabled = shouldMirror;
        console.log('[ZoomVideoService] Set mirror to:', shouldMirror, 'for', isBackCamera ? 'back' : 'front', 'camera');
      }
    } catch (e) {
      console.log('[ZoomVideoService] applyPortraitVideoSettings error:', e);
    }
    this._isBackCamera = isBackCamera;
  }

  /** Read which camera is active (uses learned device ids after first toggle). */
  async getActiveCameraIsBack() {
    try {
      const cameras = await this._getCameraList();
      const selected = this._getSelectedCamera(cameras);
      this._seedFacingMap(cameras, selected);
      return this._isDeviceBack(cameras, selected);
    } catch {
      return this._isBackCamera;
    }
  }

  /**
   * Toggle front ↔ back. When the physical camera changes we trust the
   * requested facing (Android device names are often not "front"/"back").
   * @param {boolean} preferBack
   */
  async switchToFacing(preferBack) {
    const zoom = this._requireZoom();
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

    console.log('[ZoomVideoService] switchToFacing called, preferBack:', preferBack);

    const cameras = await this._getCameraList();
    console.log('[ZoomVideoService] Available cameras:', 
      cameras.map(c => ({ id: c.deviceId, name: c.deviceName, selected: c.isSelectedDevice }))
    );

    if (!cameras.length) {
      console.log('[ZoomVideoService] No cameras found');
      return { switched: false, isBackCamera: this._isBackCamera };
    }

    const selected = this._getSelectedCamera(cameras);
    console.log('[ZoomVideoService] Currently selected camera:', 
      { id: selected?.deviceId, name: selected?.deviceName }
    );

    this._seedFacingMap(cameras, selected);
    console.log('[ZoomVideoService] Learned device IDs - front:', this._frontDeviceId, 'back:', this._backDeviceId);

    const currentIsBack = this._isDeviceBack(cameras, selected);
    console.log('[ZoomVideoService] Current camera is back?', currentIsBack, 'want back?', preferBack);

    // Don't return early - always attempt to switch to ensure we're on the right camera
    const previousId = selected?.deviceId ?? null;
    const target =
      (preferBack
        ? cameras.find(c => c.deviceId === this._backDeviceId)
        : cameras.find(c => c.deviceId === this._frontDeviceId)) ??
      cameras.find(c => c.deviceId !== previousId) ??
      null;

    console.log('[ZoomVideoService] Target camera:', 
      { id: target?.deviceId, name: target?.deviceName }
    );

    const wasVideoOn = this._isVideoOn;
    try {
      if (wasVideoOn) {
        console.log('[ZoomVideoService] Stopping video before switch');
        await zoom.videoHelper.stopVideo();
        await delay(150);
      }

      let switched = false;
      
      // Try generic switchCamera() first - it's more reliable on some devices
      console.log('[ZoomVideoService] Switching camera (generic)');
      switched = await zoom.videoHelper.switchCamera();
      console.log('[ZoomVideoService] Generic switch result:', switched);
      
      // If generic didn't work and we have a specific target, try that
      if (!switched && target?.deviceId && target.deviceId !== previousId) {
        console.log('[ZoomVideoService] Generic switch failed, trying specific camera:', target.deviceId);
        switched = await zoom.videoHelper.switchCamera(target.deviceId);
        console.log('[ZoomVideoService] Specific switch result:', switched);
      }

      await delay(320);

      if (wasVideoOn) {
        console.log('[ZoomVideoService] Restarting video after switch');
        await zoom.videoHelper.startVideo();
        // Wait longer for video stream to fully stabilize before applying settings
        await delay(750);
      }

      const afterCameras = await this._getCameraList();
      const newSelected = this._getSelectedCamera(afterCameras);
      console.log('[ZoomVideoService] After switch, selected camera:', 
        { id: newSelected?.deviceId, name: newSelected?.deviceName }
      );

      const didChange =
        Boolean(newSelected?.deviceId) &&
        Boolean(previousId) &&
        newSelected.deviceId !== previousId;

      console.log('[ZoomVideoService] Did device ID change?', didChange);

      if (didChange) {
        this._learnFacingFromSwitch(previousId, newSelected.deviceId, preferBack);
        console.log('[ZoomVideoService] Learned from switch - applying settings for preferBack:', preferBack);
        await this.applyPortraitVideoSettings(preferBack, true);
        return { switched: true, isBackCamera: preferBack };
      }

      // If device ID didn't change but we wanted to switch, try one more time with generic switch
      if (currentIsBack !== preferBack && !didChange) {
        console.log('[ZoomVideoService] Device ID unchanged but camera facing is wrong, trying one more generic switch');
        await zoom.videoHelper.switchCamera();
        await delay(320);
        
        const finalCameras = await this._getCameraList();
        const finalSelected = this._getSelectedCamera(finalCameras);
        const finalBack = this._isDeviceBack(finalCameras, finalSelected);
        console.log('[ZoomVideoService] After final retry - camera is back?', finalBack);
        
        await this.applyPortraitVideoSettings(preferBack, true);
        return { switched: finalBack === preferBack, isBackCamera: preferBack };
      }

      const fallbackBack = this._isDeviceBack(afterCameras, newSelected);
      console.log('[ZoomVideoService] Using fallback facing:', fallbackBack);
      await this.applyPortraitVideoSettings(fallbackBack, true);
      return { switched: Boolean(switched), isBackCamera: fallbackBack };
    } catch (e) {
      console.log('[ZoomVideoService] switchToFacing error:', e);
      if (wasVideoOn && this._isVideoOn) {
        try {
          await zoom.videoHelper.startVideo();
        } catch (startErr) {
          console.log('[ZoomVideoService] restart video error:', startErr);
        }
      }
      return { switched: false, isBackCamera: this._isBackCamera };
    }
  }

  /** Toggle local camera on/off. */
  async toggleVideo() {
    const zoom = this._requireZoom();
    if (this._isVideoOn) {
      await zoom.videoHelper.stopVideo();
      this._isVideoOn = false;
    } else {
      await zoom.videoHelper.startVideo();
      this._isVideoOn = true;
      // Lock rotation and apply mirror settings when video is turned back on
      await this.applyPortraitVideoSettings(this._isBackCamera, true);
    }
    console.log('[ZoomVideoService] Video', this._isVideoOn ? 'ON' : 'OFF');
    return this._isVideoOn;
  }

  /** Toggle local mic mute/unmute. */
  async toggleAudio() {
    const zoom = this._requireZoom();
    let userId = this._myUserId;
    if (!userId) {
      const myself = await zoom.session.getMySelf();
      userId = myself?.userId;
      this._myUserId = userId ?? null;
    }
    if (!userId) {
      throw new Error('Cannot toggle audio: local user id not found');
    }

    if (this._isAudioOn) {
      await zoom.audioHelper.muteAudio(userId);
      this._isAudioOn = false;
    } else {
      await zoom.audioHelper.unmuteAudio(userId);
      this._isAudioOn = true;
    }
    console.log('[ZoomVideoService] Audio', this._isAudioOn ? 'ON' : 'OFF');
    return this._isAudioOn;
  }

  /** Toggle speaker (earpiece vs speakerphone). */
  async toggleSpeaker() {
    const target = !this._isSpeakerOn;
    return this._applySpeakerRoute(target);
  }

  async setSpeakerOn(enabled) {
    return this._applySpeakerRoute(enabled);
  }

  getIsVideoOn() {
    return this._isVideoOn;
  }

  getIsAudioOn() {
    return this._isAudioOn;
  }

  getIsSpeakerOn() {
    return this._isSpeakerOn;
  }

  /** Current session metadata. */
  async getSessionInfo() {
    const zoom = this._requireZoom();
    const inSession = await zoom.isInSession();
    if (!inSession) {
      return { inSession: false };
    }

    const [sessionName, sessionId, remoteUsers, myself] = await Promise.all([
      zoom.session.getSessionName(),
      zoom.session.getSessionID(),
      zoom.session.getRemoteUsers(),
      zoom.session.getMySelf(),
    ]);

    const mappedRemoteUsers = await Promise.all(
      (remoteUsers || []).map(async u => {
        let isVideoOn = false;
        try {
          isVideoOn = (await u.videoStatus?.isOn?.()) === true;
        } catch (e) {
          console.log('[ZoomVideoService] remote videoStatus.isOn', e);
        }
        return {
          userId: u.userId,
          userName: u.userName,
          isHost: u.isHost,
          isVideoOn,
        };
      }),
    );

    return {
      inSession: true,
      sessionName,
      sessionId,
      myUserId: myself?.userId ?? this._myUserId,
      myUserName: myself?.userName,
      remoteUsers: mappedRemoteUsers,
    };
  }

  /** First remote participant userId for ZoomView. */
  async getPrimaryRemoteUserId() {
    const info = await this.getSessionInfo();
    return info.remoteUsers?.[0]?.userId ?? null;
  }
}

const ZoomVideoService = new ZoomVideoServiceClass();

export default ZoomVideoService;
