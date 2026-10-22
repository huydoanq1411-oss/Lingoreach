import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { DesignProHero } from './DesignProHero';
import './styles.css';

createRoot(document.getElementById('root')!).render(<StrictMode><DesignProHero /></StrictMode>);
