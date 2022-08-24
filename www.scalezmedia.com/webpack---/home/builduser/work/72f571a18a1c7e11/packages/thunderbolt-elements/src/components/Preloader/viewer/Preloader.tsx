import * as React from 'react';
import classnames from 'classnames';
import { IPreloaderProps } from '../Preloader.types';
import style from './style/Preloader.scss';

const Preloader: React.FC<IPreloaderProps> = props => {
  const { enabled, dark } = props;

  return (
    <div
      className={classnames(style.preloader, {
        [style.enabled]: !!enabled,
        [style.dark]: !!dark,
      })}
    />
  );
};

export default Preloader;
