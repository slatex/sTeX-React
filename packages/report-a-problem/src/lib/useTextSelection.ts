// Derived from https://github.com/juliankrispel/use-text-selection/blob/master/src/index.tsx
import { useCallback, useLayoutEffect, useState } from 'react';
import { Subscription, debounceTime, fromEvent } from 'rxjs';

type ClientRect = Record<keyof Omit<DOMRect, 'toJSON'>, number>;

function offsetBasedOnScroll(rect: ClientRect) {
  if (!rect) return rect;

  const scrolledTop =
    document.documentElement.scrollTop || document.body.scrollTop;
  const scrolledLeft =
    document.documentElement.scrollLeft || document.body.scrollLeft;

  return {
    x: rect.x + scrolledLeft,
    left: rect.left + scrolledLeft,
    right: rect.right + scrolledLeft,

    y: rect.y + scrolledTop,
    top: rect.top + scrolledTop,
    bottom: rect.bottom + scrolledTop,

    height: rect.height,
    width: rect.width,
  };
}

type TextSelectionState = {
  clientRect?: ClientRect;
  isCollapsed?: boolean;
  textContent?: string;
  commonAncestor?: Node;
};

const defaultState: TextSelectionState = {};

/**
 * useTextSelection(ref)
 *
 * @description
 * hook to get information about the current text selection
 *
 */
export function useTextSelection() {
  const [{ clientRect, isCollapsed, textContent, commonAncestor }, setState] =
    useState<TextSelectionState>(defaultState);

  const handler = useCallback((e: any) => {
    const selection = window.getSelection();
    const newState: TextSelectionState = {};

    if (selection == null || !selection.rangeCount) {
      setState(newState);
      return;
    }

    const range = selection.getRangeAt(0);

    if (range == null) {
      setState(newState);
      return;
    }

    newState.textContent = range.toString();
    newState.clientRect = offsetBasedOnScroll(range.getBoundingClientRect());
    newState.isCollapsed = range.collapsed;
    newState.commonAncestor = range.commonAncestorContainer;
    setState(newState);
  }, []);

  useLayoutEffect(() => {
    const events = ['selectionchange', 'keydown', 'keyup', 'resize'];
    const subs: Subscription[] = [];
    for (const e of events) {
      const eventObs$ = fromEvent(document, e).pipe(debounceTime(50));
      subs.push(eventObs$.subscribe(handler));
    }

    return () => {
      subs.forEach((s) => s.unsubscribe());
    };
  }, []);

  return {
    clientRect,
    isCollapsed,
    textContent,
    commonAncestor,
  };
}
