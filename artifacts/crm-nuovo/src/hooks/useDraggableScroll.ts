import { useState, useRef, useEffect } from 'react';

export function useDraggableScroll() {
  const ref = useRef<HTMLDivElement>(null);
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const hasMovedRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleMouseDown = (e: MouseEvent) => {
      setIsDown(true);
      hasMovedRef.current = false;
      el.classList.add('active');
      setStartX(e.pageX - el.offsetLeft);
      setScrollLeft(el.scrollLeft);
    };

    const handleMouseLeave = () => {
      setIsDown(false);
      el.classList.remove('active');
    };

    const handleMouseUp = (e: MouseEvent) => {
      setIsDown(false);
      el.classList.remove('active');
      
      // If we moved significantly, prevent the next click
      if (hasMovedRef.current) {
        const preventClick = (event: MouseEvent) => {
          event.stopImmediatePropagation();
          el.removeEventListener('click', preventClick, true);
        };
        el.addEventListener('click', preventClick, true);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDown) return;
      const x = e.pageX - el.offsetLeft;
      const walk = (x - startX) * 2; // Scroll speed
      
      if (Math.abs(walk) > 5) {
        hasMovedRef.current = true;
      }

      if (hasMovedRef.current) {
        e.preventDefault();
        el.scrollLeft = scrollLeft - walk;
      }
    };

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0) {
        el.scrollLeft += e.deltaY;
      }
    };

    el.addEventListener('mousedown', handleMouseDown);
    el.addEventListener('mouseleave', handleMouseLeave);
    el.addEventListener('mouseup', handleMouseUp);
    el.addEventListener('mousemove', handleMouseMove);
    el.addEventListener('wheel', handleWheel, { passive: true });

    return () => {
      el.removeEventListener('mousedown', handleMouseDown);
      el.removeEventListener('mouseleave', handleMouseLeave);
      el.removeEventListener('mouseup', handleMouseUp);
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('wheel', handleWheel);
    };
  }, [isDown, startX, scrollLeft]);

  return ref;
}
