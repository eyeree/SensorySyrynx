/** @jsxImportSource @emotion/react */
import { RecoilRoot } from 'recoil';
import { ReactNode, useEffect } from 'react';
import { useSetupList, useCreateSetup, useSetCurrentSetupId } from './setup';


type StateRootProps = {
    children?: ReactNode
}

function Initializer() {
  
    const setupList = useSetupList();
    const createSetup = useCreateSetup();
    const setCurrentSetupId = useSetCurrentSetupId();
  
    useEffect(() => {
      if(setupList.length === 0) {
        const setupId = createSetup();
        setCurrentSetupId(setupId);
      }
    })
  
    return <></>
  
}

export function StateRoot({children}:StateRootProps) {
    return <RecoilRoot>
        <Initializer/>
        {children}
    </RecoilRoot>
}
