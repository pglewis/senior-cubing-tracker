import {createContext} from 'react';
import type {DataContextType} from './data-types';

// Fast Refresh requires files with React components to only export components
// so the instance lives here rather than co-located with the data context component
export const DataContext = createContext<DataContextType | null>(null);