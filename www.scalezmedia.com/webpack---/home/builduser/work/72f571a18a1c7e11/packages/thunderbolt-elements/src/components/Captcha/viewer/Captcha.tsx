import * as React from 'react';
import { ICaptchaProps, ICaptchaImperativeActions } from '../Captcha.types';
import { useRecaptcha } from '../../../providers/useRecaptcha/useRecaptcha';
import { useHasBeenInViewport } from '../../../providers/useHasBeenInViewport/useHasBeenInViewport';
import { getDataAttributes } from '../../../core/commons/utils';
import { st, classes } from './style/Captcha.st.css';

const Captcha: React.ForwardRefRenderFunction<
  ICaptchaImperativeActions,
  ICaptchaProps
> = (props, ref) => {
  const {
    id,
    language,
    className,
    token,
    isMobileFriendly = true,
    onTokenChange = () => {},
    onMouseEnter = () => {},
    onMouseLeave = () => {},
    onError = () => {},
    onTimeout = () => {},
    onVerified = () => {},
  } = props;

  const [loaded, setLoaded] = React.useState<boolean>(false);
  const compRef = React.useRef<HTMLDivElement>(null);

  const verifiedCallback = (_token: string) => {
    onTokenChange(_token);
    onVerified({ type: 'onVerified' });
  };

  const expiredCallback = () => {
    onTokenChange(undefined);
    onTimeout({ type: 'onTimeout' });
  };

  const errorCallback = () => {
    onError({ type: 'onError' });
  };

  const loadedCallback = () => {
    setLoaded(true);
  };

  const [captchaRef, { reset: resetCaptcha }] = useRecaptcha({
    language,
    theme: 'light',
    size: 'normal',
    verifiedCallback,
    expiredCallback,
    errorCallback,
    loadedCallback,
  });

  const shouldLoadCaptcha = useHasBeenInViewport(compRef);

  React.useImperativeHandle(
    ref,
    () => {
      return {
        focus: () => {
          const iframe = document.querySelector(
            `#${id} iframe`,
          ) as HTMLIFrameElement;
          if (iframe) {
            iframe.setAttribute('title', 'Captcha');
            iframe.focus();
          }
        },
        reset: () => {
          onTokenChange(undefined);
          resetCaptcha();
        },
      };
    },
    [id, resetCaptcha, onTokenChange],
  );

  return (
    <div
      id={id}
      {...getDataAttributes(props)}
      className={st(
        classes.root,
        {
          loaded,
          isMobileFriendly,
        },
        className,
      )}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      ref={compRef}
    >
      <div className={classes.captchaLoader}></div>
      <div
        className={classes.captcha}
        ref={shouldLoadCaptcha ? captchaRef : null}
      ></div>
      <input
        className={classes.checkbox}
        type="checkbox"
        checked={!!token}
        required
        onChange={() => {}}
        tabIndex={-1}
        aria-hidden="true"
      />
    </div>
  );
};

export default React.forwardRef(Captcha);
