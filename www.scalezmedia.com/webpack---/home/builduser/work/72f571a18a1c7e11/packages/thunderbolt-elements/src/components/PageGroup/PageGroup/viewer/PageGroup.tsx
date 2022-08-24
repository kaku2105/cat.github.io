import * as React from 'react';
import { ReactNode } from 'react';
import { IPageGroupProps } from '../PageGroup.types';
import GroupContent from '../../commons/viewer/GroupContent';
import { TRANSITION_GROUP_ID } from '../../commons/constants';
import style from './style/style.scss';

const GroupContentMemo = React.memo(GroupContent, (__, nextProps) => {
  return !(nextProps.children()! as Array<ReactNode>).length;
});

const PageGroup: React.FC<IPageGroupProps> = props => {
  const { id, children, ...restProps } = props;

  return (
    <div id={id} className={style.pageGroupWrapper}>
      <GroupContentMemo
        id={`${id}_${TRANSITION_GROUP_ID}`}
        className={style.pageGroup}
        {...restProps}
      >
        {children}
      </GroupContentMemo>
    </div>
  );
};

export default PageGroup;
