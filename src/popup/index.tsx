import React from 'react';
import { createRoot } from 'react-dom/client';
import Popup from './popup';
import './popup.css';
import '../style/global.css';
import '../style/styles.css';

const container = document.getElementById('root');
if (container) {
    const root = createRoot(container);
    root.render(<Popup />);
}