/// <reference types="vite/client" />
import React from 'react';
import {createRoot} from 'react-dom/client';
import Workspace from '../components/workspace';
import '../app/globals.css';
class ErrorBoundary extends React.Component<{children:React.ReactNode},{error:boolean}>{state={error:false};static getDerivedStateFromError(){return {error:true};}render(){return this.state.error?<main style={{padding:48,fontFamily:'sans-serif'}}><h1>工作台暂时无法显示</h1><p>请刷新页面重新载入，已保存的数据会保留。</p><button onClick={()=>location.reload()}>重新载入</button></main>:this.props.children;}}
const root=import.meta.hot?.data.root??createRoot(document.getElementById('root')!);
if(import.meta.hot)import.meta.hot.data.root=root;
root.render(<ErrorBoundary><Workspace storage="browser"/></ErrorBoundary>);
