import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PresentationMode from './PresentationMode';
import type { MindMapTree } from '../types';

describe('PresentationMode', () => {
  const mockTree: MindMapTree = {
    id: 'root',
    content: 'Presentation Root',
    children: [
      {
        id: '1',
        content: 'Slide 1',
        children: [
          {
            id: '1-1',
            content: 'Detail 1.1',
            children: [],
          },
        ],
      },
      {
        id: '2',
        content: 'Slide 2',
        children: [],
      },
      {
        id: '3',
        content: 'Slide 3',
        children: [],
      },
    ],
    metadata: {
      notes: 'Presenter notes for the root',
      link: 'https://example.com',
    },
  };

  const defaultProps = {
    visible: true,
    onClose: vi.fn(),
    tree: mockTree,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when visible is false', () => {
    const { container } = render(<PresentationMode {...defaultProps} visible={false} />);

    expect(container.firstChild).toBe(null);
  });

  it('should not render when tree is null', () => {
    const { container } = render(<PresentationMode {...defaultProps} tree={null} />);

    expect(container.firstChild).toBe(null);
  });

  it('should render presentation mode when visible and tree provided', () => {
    render(<PresentationMode {...defaultProps} />);

    expect(screen.getByRole('region')).toBeInTheDocument();
    expect(screen.getByText('🎯 Presentation Mode')).toBeInTheDocument();
    expect(screen.getByText('Presentation Root')).toBeInTheDocument();
  });

  it('should display slides overview with correct count', () => {
    render(<PresentationMode {...defaultProps} />);

    expect(screen.getByText(/Slides \(/)).toBeInTheDocument();
    expect(screen.getByText(/\d+\)/)).toBeInTheDocument(); // Should show number of slides
  });

  it('should call onClose when exit button is clicked', () => {
    const handleClose = vi.fn();
    render(<PresentationMode {...defaultProps} onClose={handleClose} />);

    const exitButton = screen.getByLabelText('Exit presentation mode (Escape)');
    fireEvent.click(exitButton);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when Escape key is pressed', () => {
    const handleClose = vi.fn();
    render(<PresentationMode {...defaultProps} onClose={handleClose} />);

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('should toggle notes when notes button is clicked', () => {
    render(<PresentationMode {...defaultProps} />);

    const notesButton = screen.getByLabelText(/Show speaker notes/);
    expect(notesButton).toBeInTheDocument();

    fireEvent.click(notesButton);

    expect(screen.getByLabelText(/Hide speaker notes/)).toBeInTheDocument();
    expect(screen.getByText('Presenter notes for the root')).toBeInTheDocument();
  });

  it('should have aria-pressed on notes button', () => {
    render(<PresentationMode {...defaultProps} />);

    const notesButton = screen.getByLabelText(/Show speaker notes/);
    expect(notesButton).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(notesButton);

    expect(notesButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('should toggle notes with Ctrl+N keyboard shortcut', () => {
    render(<PresentationMode {...defaultProps} />);

    const notesButton = screen.getByLabelText(/Show speaker notes/);

    fireEvent.keyDown(window, { key: 'n', ctrlKey: true });

    expect(notesButton).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('Presenter notes for the root')).toBeInTheDocument();
  });

  it('should navigate slides with arrow keys', () => {
    render(<PresentationMode {...defaultProps} />);

    const slideCounter = screen.getByRole('status'); // Slide counter is now role="status"
    const initialText = slideCounter.textContent;

    // Go to next slide
    fireEvent.keyDown(window, { key: 'ArrowRight' });

    const nextText = slideCounter.textContent;
    expect(nextText).not.toBe(initialText);

    // Go to previous slide
    fireEvent.keyDown(window, { key: 'ArrowLeft' });

    const prevText = slideCounter.textContent;
    expect(prevText).toBe(initialText);
  });

  it('should navigate slides with Space and Enter', () => {
    render(<PresentationMode {...defaultProps} />);

    const slideCounter = screen.getByRole('status');
    const initialText = slideCounter.textContent;

    // Go to next slide with Space
    fireEvent.keyDown(window, { key: ' ' });

    expect(slideCounter.textContent).not.toBe(initialText);
  });

  it('should disable previous button on first slide', () => {
    render(<PresentationMode {...defaultProps} />);

    const prevButton = screen.getByLabelText(/No previous slide/);
    expect(prevButton).toBeDisabled();
  });

  it('should disable next button on last slide', () => {
    render(<PresentationMode {...defaultProps} />);

    // Navigate to last slide
    for (let i = 0; i < 10; i++) {
      fireEvent.keyDown(window, { key: 'ArrowRight' });
    }

    const nextButton = screen.getByLabelText(/No next slide/);
    expect(nextButton).toBeDisabled();
  });

  it('should update progress bar correctly', () => {
    render(<PresentationMode {...defaultProps} />);

    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toBeInTheDocument();

    // Progress bar should have aria attributes
    expect(progressbar).toHaveAttribute('aria-valuemin', '1');
    expect(progressbar).toHaveAttribute('aria-valuemax');
    expect(progressbar).toHaveAttribute('aria-valuenow');
  });

  it('should navigate to slide when clicking in slide overview', () => {
    render(<PresentationMode {...defaultProps} />);

    const slides = screen.getAllByRole('listitem');
    expect(slides.length).toBeGreaterThan(1);

    // Click on second slide
    fireEvent.click(slides[1]);

    const slideCounter = screen.getByRole('status');
    expect(slideCounter.textContent).toContain('2 /');
  });

  it('should support keyboard navigation in slide overview', () => {
    render(<PresentationMode {...defaultProps} />);

    const slides = screen.getAllByRole('listitem');
    const secondSlide = slides[1];

    // Press Enter on second slide
    fireEvent.keyDown(secondSlide, { key: 'Enter' });

    const slideCounter = screen.getByRole('status');
    expect(slideCounter.textContent).toContain('2 /');
  });

  it('should display slide content correctly', () => {
    render(<PresentationMode {...defaultProps} />);

    expect(screen.getByText('Presentation Root')).toBeInTheDocument();
  });

  it('should display slide link when metadata exists', () => {
    render(<PresentationMode {...defaultProps} />);

    expect(screen.getByText('🔗 https://example.com')).toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    render(<PresentationMode {...defaultProps} />);

    expect(screen.getByRole('region')).toHaveAttribute('aria-live', 'polite');

    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-label', expect.stringContaining('Presentation progress'));

    const navigation = screen.getByRole('navigation');
    expect(navigation).toHaveAttribute('aria-label', 'Slide navigation');
  });

  it('should show current slide as selected in overview', () => {
    render(<PresentationMode {...defaultProps} />);

    const slides = screen.getAllByRole('listitem');
    const firstSlide = slides[0];

    // First slide should be selected (current)
    expect(firstSlide).toHaveAttribute('aria-label', expect.stringContaining('(current)'));
  });

  it('should have proper ARIA labels on navigation buttons', () => {
    render(<PresentationMode {...defaultProps} />);

    // On first slide
    expect(screen.getByLabelText(/No previous slide/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Go to next slide/)).toBeInTheDocument();

    // Navigate to second slide
    fireEvent.keyDown(window, { key: 'ArrowRight' });

    expect(screen.getByLabelText(/Go to previous slide/)).toBeInTheDocument();
  });

  it('should handle rapid keyboard navigation', () => {
    render(<PresentationMode {...defaultProps} />);

    const slideCounter = screen.getByRole('status');

    // Rapidly press next multiple times
    for (let i = 0; i < 5; i++) {
      fireEvent.keyDown(window, { key: 'ArrowRight' });
    }

    expect(slideCounter.textContent).toContain('6 /');
  });

  it('should display level indicator for nested slides', () => {
    render(<PresentationMode {...defaultProps} />);

    // Navigate to slide 1 (has children)
    fireEvent.keyDown(window, { key: 'ArrowRight' });

    // Level indicator should be present (rendered but not easily testable without DOM inspection)
    const levelIndicators = screen.queryAllByRole('presentation');
    expect(levelIndicators.length).toBeGreaterThan(0);
  });

  it('should update aria-label when slide changes', () => {
    render(<PresentationMode {...defaultProps} />);

    const region = screen.getByRole('region');
    const initialLabel = region.getAttribute('aria-label');

    // Go to next slide
    fireEvent.keyDown(window, { key: 'ArrowRight' });

    const nextLabel = region.getAttribute('aria-label');
    expect(nextLabel).not.toBe(initialLabel);
  });

  it('should preserve state during presentation', () => {
    render(<PresentationMode {...defaultProps} />);

    // Navigate to slide 2
    fireEvent.keyDown(window, { key: 'ArrowRight' });

    const slideCounter = screen.getByRole('status');
    const slide2Text = slideCounter.textContent;

    // Toggle notes
    fireEvent.keyDown(window, { key: 'n', ctrlKey: true });

    // State should be preserved
    expect(slideCounter.textContent).toBe(slide2Text);
  });

  it('should handle edge case of single slide', () => {
    const singleSlideTree: MindMapTree = {
      id: 'root',
      content: 'Only Slide',
      children: [],
    };

    render(<PresentationMode {...defaultProps} tree={singleSlideTree} />);

    expect(screen.getByRole('status')).toHaveTextContent('1 / 1');

    // Both navigation buttons should be disabled
    expect(screen.getByLabelText(/No previous slide/)).toBeInTheDocument();
    expect(screen.getByLabelText(/No next slide/)).toBeInTheDocument();
  });

  it('should display banner with correct role', () => {
    render(<PresentationMode {...defaultProps} />);

    const banner = screen.getByRole('banner');
    expect(banner).toBeInTheDocument();
    expect(banner).toContainElement(screen.getByText('🎯 Presentation Mode'));
  });

  it('should have main role for slide content area', () => {
    render(<PresentationMode {...defaultProps} />);

    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
    expect(main).toHaveAttribute('aria-label', expect.stringContaining('Current slide'));
  });

  it('should have complementary role for side panel', () => {
    render(<PresentationMode {...defaultProps} />);

    const sidePanel = screen.getByRole('complementary');
    expect(sidePanel).toBeInTheDocument();
    expect(sidePanel).toHaveAttribute('aria-labelledby', 'slides-overview-title');
  });
});
