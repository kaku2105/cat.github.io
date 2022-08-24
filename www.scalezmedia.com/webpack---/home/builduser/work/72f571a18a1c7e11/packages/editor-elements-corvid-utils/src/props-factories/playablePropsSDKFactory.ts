import { SyntheticEvent } from 'react';
import type {
  CorvidSDKPropsFactory,
  IComponentEvent,
  CorvidEventHandler,
  SdkInstance,
} from '@wix/editor-elements-types/corvid';
import { withValidation } from '../validations';
import { registerCorvidEvent } from '../corvidEvents';

export interface PauseEvent<T = Element> extends SyntheticEvent<T> {
  target: EventTarget & { type: 'autoplayOff' };
}

export interface PlayEvent<T = Element> extends SyntheticEvent<T> {
  target: EventTarget & { type: 'autoplayOn' };
}

export interface IPlayablePropsSDKActions {
  play: () => void;
  pause: () => void;
  isPlaying?: boolean;
  onPlay?: (e: IComponentEvent<'autoplayOn'>) => void;
  onPause?: (e: IComponentEvent<'autoplayOff'>) => void;
}

export interface IPlayablePropsSDKRefActions {
  play: () => void;
  pause: () => void;
  next: () => void;
  previous: () => void;
}

export type IPlayableControllerActions = {
  play: () => void;
  pause: () => void;
};

export interface IPlayablePropsSDKProps {
  isPlaying: boolean;
}

export interface IPlayableCommonPropsSDK {
  next: () => Promise<Element>;
  previous: () => Promise<Element>;
  isPlaying: boolean;
}

export interface IPlayablePropsSDK extends IPlayableCommonPropsSDK {
  play: () => void;
  pause: () => void;
  onPlay: (cb: CorvidEventHandler) => void;
  onPause: (cb: CorvidEventHandler) => void;
}

const _playablePropsSDKFactory: CorvidSDKPropsFactory<
  IPlayablePropsSDKProps,
  IPlayablePropsSDK
> = api => {
  return {
    get isPlaying() {
      return api.props.isPlaying;
    },
    play() {
      api.compRef.play();
      return api.getSdkInstance();
    },
    pause() {
      api.compRef.pause();
      return api.getSdkInstance();
    },
    onPlay: handler => registerCorvidEvent('onPlay', api, handler),
    onPause: handler => registerCorvidEvent('onPause', api, handler),
    next() {
      return new Promise<SdkInstance>((resolve, reject) => {
        reject('sdk method not implemented');
      });
    },
    previous() {
      return new Promise<SdkInstance>((resolve, reject) => {
        reject('sdk method not implemented');
      });
    },
  };
};

export const playablePropsSDKFactory = withValidation(
  _playablePropsSDKFactory,
  {
    type: ['object'],
    properties: {},
  },
);
