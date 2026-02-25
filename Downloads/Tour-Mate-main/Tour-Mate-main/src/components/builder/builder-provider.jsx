'use client';

import React, { useState, ReactNode, useCallback } from 'react';
import { BuilderContext } from '@/hooks/use-builder';

export function BuilderProvider({ children }) {
  const [elements, setElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(
    null
  );
  const [seoConfig, setSeoConfig] = useState({
    title: 'My Awesome Website',
    description: 'Built with Genesis Canvas',
  });
  const [previewMode, setPreviewMode] = useState('desktop');

  const addElement = useCallback(
    (index, element) => {
      const newElement = {
        ...element,
        id: `${element.type}-${Date.now()}-${Math.random()}`,
      };
      setElements(prevElements => {
        const newElements = [...prevElements];
        newElements.splice(index, 0, newElement);
        return newElements;
      });
    },
    []
  );

  const removeElement = useCallback((id) => {
    setElements(prev => prev.filter(el => el.id !== id));
  }, []);

  const updateElement = useCallback(
    (id, newProps) => {
      setElements(prev =>
        prev.map(el =>
          el.id === id ? { ...el, props: { ...el.props, ...newProps } } : el
        )
      );
    },
    []
  );

  const value = {
    elements,
    setElements,
    addElement,
    removeElement,
    updateElement,
    selectedElement,
    setSelectedElement,
    seoConfig,
    setSeoConfig,
    previewMode,
    setPreviewMode,
  };

  return (
    <BuilderContext.Provider value={value}>{children}</BuilderContext.Provider>
  );
}
