import { useState, useEffect, useCallback } from 'react';
import type { MindMapTree } from '../types';

interface PresentationModeProps {
  visible: boolean;
  onClose: () => void;
  tree: MindMapTree | null;
}

interface Slide {
  id: string;
  content: string;
  level: number;
  children?: Slide[];
  metadata?: {
    notes?: string;
    link?: string;
    image?: string;
  };
}

export default function PresentationMode({ visible, onClose, tree }: PresentationModeProps) {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [direction, setDirection] = useState<'next' | 'prev' | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showNotes, setShowNotes] = useState(false);

  // Reset slides when tree changes
  /* eslint-disable-next-line react-hooks/set-state-in-effect */
  useEffect(() => {
    if (tree) {
      const generatedSlides = generateSlides(tree);
      setSlides(generatedSlides);
      setCurrentSlideIndex(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tree]);

  // Navigation callbacks (must be declared before the keyboard effect)
  const nextSlide = useCallback(() => {
    if (isAnimating || currentSlideIndex >= slides.length - 1) return;
    setIsAnimating(true);
    setDirection('next');
    setTimeout(() => {
      setCurrentSlideIndex(prev => prev + 1);
      setIsAnimating(false);
    }, 300);
  }, [currentSlideIndex, slides.length, isAnimating]);

  const prevSlide = useCallback(() => {
    if (isAnimating || currentSlideIndex <= 0) return;
    setIsAnimating(true);
    setDirection('prev');
    setTimeout(() => {
      setCurrentSlideIndex(prev => prev - 1);
      setIsAnimating(false);
    }, 300);
  }, [currentSlideIndex, isAnimating]);

  // Keyboard navigation
  useEffect(() => {
    if (!visible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
        case ' ':
        case 'Enter':
          e.preventDefault();
          nextSlide();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          prevSlide();
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
        case 'n':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            setShowNotes(!showNotes);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [visible, currentSlideIndex, slides.length, showNotes, nextSlide, prevSlide, onClose]);

  const goToSlide = (index: number) => {
    if (isAnimating || index === currentSlideIndex) return;
    setIsAnimating(true);
    setDirection(index > currentSlideIndex ? 'next' : 'prev');
    setTimeout(() => {
      setCurrentSlideIndex(index);
      setIsAnimating(false);
    }, 300);
  };

  if (!visible || !tree || slides.length === 0) return null;

  const currentSlide = slides[currentSlideIndex];
  const progress = ((currentSlideIndex + 1) / slides.length) * 100;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)',
        zIndex: 2000,
        display: 'flex',
        flexDirection: 'column',
        color: 'white',
      }}
    >
      {/* Top Bar */}
      <div
        style={{
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(0,0,0,0.2)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>
            🎯 Presentation Mode
          </h1>
          <span style={{ fontSize: '14px', opacity: 0.8 }}>
            {tree.content}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setShowNotes(!showNotes)}
            style={{
              padding: '8px 12px',
              background: showNotes ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: 'white',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            📝 Notes
          </button>

          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              background: 'rgba(239, 68, 68, 0.8)',
              border: 'none',
              color: 'white',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
            }}
          >
            Exit (Esc)
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)' }}>
        <div
          style={{
            height: '100%',
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
            transition: 'width 0.3s',
          }}
        />
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', position: 'relative' }}>
        {/* Slide Content */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '40px',
            position: 'relative',
          }}
        >
          <div
            style={{
              maxWidth: '900px',
              width: '100%',
              transform: getSlideTransform(direction, isAnimating),
              transition: 'transform 0.3s ease-out',
            }}
          >
            {/* Level Indicator */}
            {currentSlide.level > 0 && (
              <div
                style={{
                  marginBottom: '20px',
                  display: 'flex',
                  gap: '8px',
                }}
              >
                {Array.from({ length: currentSlide.level }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: '40px',
                      height: '4px',
                      background: 'rgba(255,255,255,0.3)',
                      borderRadius: '2px',
                    }}
                  />
                ))}
              </div>
            )}

            {/* Slide Title */}
            <h2
              style={{
                fontSize: '48px',
                fontWeight: 'bold',
                margin: '0 0 24px 0',
                textShadow: '0 2px 20px rgba(0,0,0,0.3)',
                lineHeight: 1.2,
              }}
            >
              {currentSlide.content}
            </h2>

            {/* Slide Metadata */}
            {currentSlide.metadata?.notes && showNotes && (
              <div
                style={{
                  marginTop: '24px',
                  padding: '16px',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  fontSize: '16px',
                  lineHeight: 1.6,
                }}
              >
                <strong>Notes:</strong> {currentSlide.metadata.notes}
              </div>
            )}

            {currentSlide.metadata?.link && (
              <div
                style={{
                  marginTop: '16px',
                  fontSize: '14px',
                  opacity: 0.8,
                }}
              >
                🔗 {currentSlide.metadata.link}
              </div>
            )}

            {/* Children Preview */}
            {currentSlide.children && currentSlide.children.length > 0 && (
              <div
                style={{
                  marginTop: '32px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '16px',
                  width: '100%',
                }}
              >
                {currentSlide.children.slice(0, 6).map((child, index) => (
                  <div
                    key={child.id}
                    style={{
                      padding: '12px',
                      background: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '8px',
                      fontSize: '14px',
                      animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`,
                    }}
                  >
                    {child.content}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Side Panel - Slide Overview */}
        <div
          style={{
            width: '280px',
            background: 'rgba(0,0,0,0.3)',
            borderLeft: '1px solid rgba(255,255,255,0.1)',
            padding: '20px',
            overflowY: 'auto',
          }}
        >
          <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: 'bold', opacity: 0.8 }}>
            Slides ({slides.length})
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                onClick={() => goToSlide(index)}
                style={{
                  padding: '12px',
                  background: index === currentSlideIndex
                    ? 'rgba(102, 126, 234, 0.5)'
                    : 'rgba(255,255,255,0.05)',
                  border: index === currentSlideIndex
                    ? '2px solid #667eea'
                    : '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontSize: '13px',
                }}
                onMouseEnter={(e) => {
                  if (index !== currentSlideIndex) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (index !== currentSlideIndex) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ opacity: 0.6, fontSize: '11px' }}>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {slide.content}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div
        style={{
          padding: '20px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(0,0,0,0.2)',
        }}
      >
        <button
          onClick={prevSlide}
          disabled={currentSlideIndex === 0}
          style={{
            padding: '12px 24px',
            background: currentSlideIndex > 0 ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: 'white',
            borderRadius: '8px',
            cursor: currentSlideIndex > 0 ? 'pointer' : 'not-allowed',
            fontSize: '14px',
            fontWeight: 'bold',
            opacity: currentSlideIndex > 0 ? 1 : 0.5,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          ← Previous
        </button>

        <div style={{ fontSize: '14px', opacity: 0.8 }}>
          {currentSlideIndex + 1} / {slides.length}
        </div>

        <button
          onClick={nextSlide}
          disabled={currentSlideIndex >= slides.length - 1}
          style={{
            padding: '12px 24px',
            background: currentSlideIndex < slides.length - 1 ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: 'white',
            borderRadius: '8px',
            cursor: currentSlideIndex < slides.length - 1 ? 'pointer' : 'not-allowed',
            fontSize: '14px',
            fontWeight: 'bold',
            opacity: currentSlideIndex < slides.length - 1 ? 1 : 0.5,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          Next →
        </button>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

/**
 * Generate slides from mind map tree
 */
function generateSlides(tree: MindMapTree): Slide[] {
  const slides: Slide[] = [];

  const traverse = (node: MindMapTree, level: number = 0): Slide => {
    const slide: Slide = {
      id: node.id,
      content: node.content,
      level,
      metadata: node.metadata,
    };

    if (node.children && node.children.length > 0) {
      slide.children = node.children.map(child => traverse(child, level + 1));
    }

    return slide;
  };

  // Add root slide
  slides.push(traverse(tree));

  // Add child slides breadth-first
  const queue = [...(tree.children || [])];
  while (queue.length > 0) {
    const node = queue.shift()!;
    slides.push(traverse(node));

    if (node.children) {
      queue.push(...node.children);
    }
  }

  return slides;
}

/**
 * Get slide transform based on direction
 */
function getSlideTransform(direction: 'next' | 'prev' | null, isAnimating: boolean): string {
  if (!isAnimating) return 'translateX(0)';

  if (direction === 'next') {
    return 'translateX(-100%)';
  } else if (direction === 'prev') {
    return 'translateX(100%)';
  }

  return 'translateX(0)';
}
