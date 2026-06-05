import React, { Component } from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';
import { VideoAspect, ZoomView } from '@zoom/react-native-videosdk';
import ZoomVideoService from '../services/ZoomVideoService';

type SafeZoomViewProps = {
  userId?: string;
  preview?: boolean;
  isPiPView?: boolean;
  style?: StyleProp<ViewStyle>;
  videoAspect?: VideoAspect;
  fullScreen?: boolean;
  /** Only local PiP should end the session when destroyed (reload / leave). */
  releaseSessionOnUnmount?: boolean;
};

/**
 * Wraps ZoomView and releases the native session before unmount (Metro reload).
 */
export default class SafeZoomView extends Component<SafeZoomViewProps> {
  componentWillUnmount() {
    if (!this.props.releaseSessionOnUnmount) {
      return;
    }
    ZoomVideoService.releaseActiveSessionSync();
  }

  render() {
    const { releaseSessionOnUnmount: _release, ...viewProps } = this.props;
    return <ZoomView {...viewProps} />;
  }
}
