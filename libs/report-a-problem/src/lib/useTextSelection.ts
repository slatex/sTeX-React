// Derived from https://github.com/juliankrispel/use-text-selection/blob/master/src/index.tsx
import { useCallback, useLayoutEffect, useState } from 'react'

type ClientRect = Record<keyof Omit<DOMRect, "toJSON">, number>

function roundValues(_rect: ClientRect) {
  const rect = {
    ..._rect
  }
  for (const key of Object.keys(rect)) {
    rect[key] = Math.round(rect[key])
  }
  return rect
}

function shallowDiff(prev: any, next: any) {
  if (prev != null && next != null) {
    for (const key of Object.keys(next)) {
      if (prev[key] != next[key]) {
        return true
      }
    }
  } else if (prev != next) {
    return true
  }
  return false
}

function offsetBasedOnScroll(rect: ClientRect) {
  const scrolledTop = document.documentElement.scrollTop || document.body.scrollTop;
  const scrolledLeft = document.documentElement.scrollLeft || document.body.scrollLeft;
  rect.y += scrolledTop;
  rect.top += scrolledTop;
  rect.bottom += scrolledTop;

  rect.x += scrolledLeft;
  rect.left += scrolledLeft;
  rect.right += scrolledLeft;
  return rect;
}


type TextSelectionState = {
  clientRect?: ClientRect,
  isCollapsed?: boolean,
  textContent?: string,
  commonAncestor?: Node,
}

const defaultState: TextSelectionState = {}

/**
 * useTextSelection(ref)
 *
 * @description
 * hook to get information about the current text selection
 *
 */
export function useTextSelection(target?: HTMLElement) {

  const [{
    clientRect,
    isCollapsed,
    textContent,
    commonAncestor
  }, setState] = useState<TextSelectionState>(defaultState)

  const reset = useCallback(() => {
    setState(defaultState)
  }, [])

  const handler = useCallback(() => {
    let newRect: ClientRect
    const selection = window.getSelection()
    const newState: TextSelectionState = { }

    if (selection == null || !selection.rangeCount) {
      setState(newState)
      return
    }

    const range = selection.getRangeAt(0)

    if (target != null && !target.contains(range.commonAncestorContainer)) {
      setState(newState)
      return
    }

    if (range == null) {
      setState(newState)
      return
    }

    const contents = range.cloneContents()

    if (contents.textContent != null) {
      newState.textContent = contents.textContent
    }

    const rects = range.getClientRects()

    if (rects.length === 0 && range.commonAncestorContainer != null) {
      const el = range.commonAncestorContainer as HTMLElement
      newRect = roundValues(el.getBoundingClientRect().toJSON())
    } else {
      if (rects.length < 1) return
      newRect = roundValues(rects[0].toJSON())
    }
    newRect = offsetBasedOnScroll(newRect)
    if (shallowDiff(clientRect, newRect)) {
      newState.clientRect = newRect
    }
    newState.isCollapsed = range.collapsed
    newState.commonAncestor = range.commonAncestorContainer;

    setState(newState)
  }, [target])

  useLayoutEffect(() => {
    document.addEventListener('selectionchange', handler)
    document.addEventListener('keydown', handler)
    document.addEventListener('keyup', handler)
    window.addEventListener('resize', handler)

    return () => {
      document.removeEventListener('selectionchange', handler)
      document.removeEventListener('keydown', handler)
      document.removeEventListener('keyup', handler)
      window.removeEventListener('resize', handler)
    }
  }, [target])

  return {
    clientRect,
    isCollapsed,
    textContent,
    commonAncestor
  }
}
