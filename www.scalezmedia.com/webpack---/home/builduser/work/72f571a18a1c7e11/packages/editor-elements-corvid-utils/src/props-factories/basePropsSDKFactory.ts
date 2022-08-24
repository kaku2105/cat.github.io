import type { CorvidSDKPropsFactory } from '@wix/editor-elements-types/corvid';

export interface IBasePropSDK {
  id: string;
  role: string;
  connectionConfig?: Record<string, any>;
  uniqueId: string;
  parent: any;
  global: boolean;
  type: string;
  scrollTo(): Promise<void>;
  toJSON(): object;
}

export const basePropsSDKFactory: CorvidSDKPropsFactory<{}, IBasePropSDK> = ({
  handlers,
  metaData,
}) => {
  const { compId, connection, compType, isGlobal, getParent, role, wixCodeId } =
    metaData;

  const type = `$w.${compType}`;
  return {
    get id() {
      return wixCodeId || role; // TODO check with @zivp if forms need this "|| role" and if not remove it.
    },
    get role() {
      return role;
    },
    get connectionConfig() {
      return connection?.config;
    },
    get uniqueId() {
      return compId;
    },
    get parent() {
      return getParent();
    },
    get global() {
      return isGlobal();
    },
    get type() {
      return type;
    },
    scrollTo() {
      return new Promise(resolve =>
        handlers.scrollToComponent(compId, resolve),
      );
    },
    toJSON() {
      return { id: role, type, global: isGlobal() };
    },
  };
};
