import * as React from 'react';
import type {
  CorvidSDKPropsFactory,
  CorvidKeyboardEventHandler,
  CorvidEventHandler,
  IComponentEvent,
} from '@wix/editor-elements-types/corvid';
import { withValidation } from '../validations';
import {
  registerCorvidKeyboardEvent,
  registerCorvidEvent,
} from '../corvidEvents';

export interface ITextInputPropSDKProps {
  placeholder?: string;
  maxLength?: number | null;
}

export interface ITextInputPropSDK {
  placeholder: string;
  maxLength?: number | null;
  onKeyPress: (handler: CorvidKeyboardEventHandler) => void;
  onInput: (handler: CorvidEventHandler) => void;
}

export interface ITextInputPropsSDKActions<T = Element> {
  onKeyPress: (event: IComponentEvent<string, React.KeyboardEvent<T>>) => void;
  onInput: (event: IComponentEvent<string, React.FormEvent<T>>) => void;
}

const _textInputPropsSDKFactory: CorvidSDKPropsFactory<
  ITextInputPropSDKProps,
  ITextInputPropSDK
> = api => {
  return {
    get placeholder() {
      return api.props.placeholder || '';
    },
    set placeholder(value) {
      const placeholder = value || '';
      api.setProps({ placeholder });
    },
    get maxLength() {
      return api.props.maxLength;
    },
    set maxLength(value) {
      const maxLength = value === null || value === undefined ? null : value;
      api.setProps({ maxLength });
    },
    onKeyPress: handler =>
      registerCorvidKeyboardEvent('onKeyPress', api, handler),
    onInput: handler => registerCorvidEvent('onInput', api, handler),
  };
};

export const textInputPropsSDKFactory = withValidation(
  _textInputPropsSDKFactory,
  {
    type: ['object'],
    properties: {
      placeholder: {
        type: ['string', 'nil'],
        warnIfNil: true,
      },
      maxLength: {
        type: ['integer', 'nil'],
        warnIfNil: true,
        minimum: 0,
      },
    },
  },
);
