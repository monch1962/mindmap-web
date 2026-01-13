import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import RichTextEditor from './RichTextEditor';

describe('RichTextEditor', () => {
  const defaultProps = {
    content: 'Initial content',
    onChange: vi.fn(),
    onSave: vi.fn(),
    onCancel: vi.fn(),
    placeholder: 'Enter text...',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock execCommand
    document.execCommand = vi.fn(() => true);
  });

  it('should render editor with initial content', () => {
    render(<RichTextEditor {...defaultProps} />);

    const editor = screen.getByRole('textbox');
    expect(editor).toBeInTheDocument();
  });

  it('should render toolbar with all buttons', () => {
    render(<RichTextEditor {...defaultProps} />);

    expect(screen.getByRole('toolbar')).toBeInTheDocument();

    // Check formatting buttons
    expect(screen.getByLabelText('Make text bold (Ctrl+B)')).toBeInTheDocument();
    expect(screen.getByLabelText('Make text italic (Ctrl+I)')).toBeInTheDocument();
    expect(screen.getByLabelText('Underline text (Ctrl+U)')).toBeInTheDocument();
    expect(screen.getByLabelText('Apply red color to text')).toBeInTheDocument();
    expect(screen.getByLabelText('Apply blue color to text')).toBeInTheDocument();
    expect(screen.getByLabelText('Apply green color to text')).toBeInTheDocument();
    expect(screen.getByLabelText('Apply orange color to text')).toBeInTheDocument();
    expect(screen.getByLabelText('Clear text formatting')).toBeInTheDocument();
    expect(screen.getByLabelText('Insert link')).toBeInTheDocument();
  });

  it('should have toolbar separators', () => {
    render(<RichTextEditor {...defaultProps} />);

    const separators = screen.getAllByRole('separator');
    expect(separators.length).toBe(2);
  });

  it('should call onChange when editor content changes', () => {
    const handleChange = vi.fn();
    render(<RichTextEditor {...defaultProps} onChange={handleChange} />);

    const editor = screen.getByRole('textbox');
    editor.innerHTML = 'New content';

    // Trigger input event
    fireEvent.input(editor);

    expect(handleChange).toHaveBeenCalled();
  });

  it('should call onSave and onCancel on keyboard shortcuts', () => {
    const handleSave = vi.fn();
    const handleCancel = vi.fn();

    render(<RichTextEditor {...defaultProps} onSave={handleSave} onCancel={handleCancel} />);

    const editor = screen.getByRole('textbox');

    // Test Enter key (save)
    fireEvent.keyDown(editor, { key: 'Enter' });
    expect(handleSave).toHaveBeenCalled();

    // Test Escape key (cancel)
    fireEvent.keyDown(editor, { key: 'Escape' });
    expect(handleCancel).toHaveBeenCalled();
  });

  it('should show link modal when link button is clicked', () => {
    render(<RichTextEditor {...defaultProps} />);

    const linkButton = screen.getByLabelText('Insert link');
    fireEvent.click(linkButton);

    // Check for link input
    const linkInput = screen.getByLabelText('Enter link URL');
    expect(linkInput).toBeInTheDocument();
  });

  it('should have aria-haspopup on link button', () => {
    render(<RichTextEditor {...defaultProps} />);

    const linkButton = screen.getByLabelText('Insert link');
    expect(linkButton).toHaveAttribute('aria-haspopup', 'dialog');
  });

  it('should call execCommand on toolbar button clicks', () => {
    const execCommandSpy = vi.spyOn(document, 'execCommand');

    render(<RichTextEditor {...defaultProps} />);

    // Click bold button
    const boldButton = screen.getByLabelText('Make text bold (Ctrl+B)');
    fireEvent.mouseDown(boldButton);

    expect(execCommandSpy).toHaveBeenCalledWith('bold', false, '');
  });

  it('should handle color button clicks', () => {
    const execCommandSpy = vi.spyOn(document, 'execCommand');

    render(<RichTextEditor {...defaultProps} />);

    // Click red color button
    const redButton = screen.getByLabelText('Apply red color to text');
    fireEvent.mouseDown(redButton);

    expect(execCommandSpy).toHaveBeenCalledWith('foreColor', false, '#ef4444');
  });

  it('should handle clear formatting button', () => {
    const execCommandSpy = vi.spyOn(document, 'execCommand');

    render(<RichTextEditor {...defaultProps} />);

    const clearButton = screen.getByLabelText('Clear text formatting');
    fireEvent.mouseDown(clearButton);

    expect(execCommandSpy).toHaveBeenCalledWith('removeFormat', false, '');
  });

  it('should close link modal when Escape is pressed', () => {
    render(<RichTextEditor {...defaultProps} />);

    // Open link modal
    const linkButton = screen.getByLabelText('Insert link');
    fireEvent.click(linkButton);

    const linkInput = screen.getByLabelText('Enter link URL');
    expect(linkInput).toBeInTheDocument();

    // Press Escape
    fireEvent.keyDown(linkInput, { key: 'Escape' });

    // Modal should close
    expect(screen.queryByLabelText('Enter link URL')).not.toBeInTheDocument();
  });

  it('should add link when Enter is pressed in link input', () => {
    render(<RichTextEditor {...defaultProps} />);

    // Open link modal
    const linkButton = screen.getByLabelText('Insert link');
    fireEvent.click(linkButton);

    const linkInput = screen.getByLabelText('Enter link URL') as HTMLInputElement;
    fireEvent.change(linkInput, { target: { value: 'https://example.com' } });

    // Press Enter
    fireEvent.keyDown(linkInput, { key: 'Enter' });

    // Modal should close
    expect(screen.queryByLabelText('Enter link URL')).not.toBeInTheDocument();
  });

  it('should display footer with keyboard shortcuts', () => {
    render(<RichTextEditor {...defaultProps} />);

    const footer = screen.getByRole('status');
    expect(footer).toBeInTheDocument();
    expect(footer).toHaveTextContent('Enter to save, Escape to cancel');
  });

  it('should have correct accessibility attributes', () => {
    render(<RichTextEditor {...defaultProps} />);

    const editor = screen.getByRole('textbox');
    expect(editor).toHaveAttribute('aria-multiline', 'true');
    expect(editor).toHaveAttribute('aria-label', 'Text editor');

    const container = screen.getByRole('region');
    expect(container).toHaveAttribute('aria-label', 'Rich text editor');
  });

  it('should focus editor after toolbar button click', () => {
    render(<RichTextEditor {...defaultProps} />);

    const editor = screen.getByRole('textbox') as HTMLElement;
    const focusSpy = vi.spyOn(editor, 'focus');

    const boldButton = screen.getByLabelText('Make text bold (Ctrl+B)');
    fireEvent.mouseDown(boldButton);

    expect(focusSpy).toHaveBeenCalled();
  });

  it('should handle custom placeholder', () => {
    const customPlaceholder = 'Type your notes here...';
    render(
      <RichTextEditor {...defaultProps} placeholder={customPlaceholder} />
    );

    const editor = screen.getByRole('textbox');
    expect(editor).toHaveAttribute('data-placeholder', customPlaceholder);
  });

  it('should render all color buttons with correct colors', () => {
    render(<RichTextEditor {...defaultProps} />);

    const redButton = screen.getByLabelText('Apply red color to text');
    const blueButton = screen.getByLabelText('Apply blue color to text');
    const greenButton = screen.getByLabelText('Apply green color to text');
    const orangeButton = screen.getByLabelText('Apply orange color to text');

    expect(redButton).toBeInTheDocument();
    expect(blueButton).toBeInTheDocument();
    expect(greenButton).toBeInTheDocument();
    expect(orangeButton).toBeInTheDocument();
  });

  it('should sanitize HTML on initialization', () => {
    const dangerousContent = '<script>alert("xss")</script>Hello';

    render(<RichTextEditor {...defaultProps} content={dangerousContent} />);

    const editor = screen.getByRole('textbox');
    expect(editor.innerHTML).not.toContain('<script>');
  });

  it('should have proper label association for link input', () => {
    render(<RichTextEditor {...defaultProps} />);

    // Open link modal
    const linkButton = screen.getByLabelText('Insert link');
    fireEvent.click(linkButton);

    const linkInput = screen.getByLabelText('Enter link URL');
    const label = screen.queryByText('Enter link URL');

    expect(linkInput).toHaveAttribute('id', 'link-url-input');
    expect(label).toBeInTheDocument();
  });
});
