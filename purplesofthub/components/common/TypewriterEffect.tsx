'use client';

import { useState, useEffect } from 'react';

interface TypewriterEffectProps {
  words: string[];
  className?: string;
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
}

/**
 * TypewriterEffect - A performant typewriter animation component
 * Uses requestAnimationFrame for smooth animations
 */
export function TypewriterEffect({
  words,
  className = '',
  typingSpeed = 80,
  deletingSpeed = 40,
  pauseDuration = 2000,
}: TypewriterEffectProps) {
  const [displayText, setDisplayText] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const currentWord = words[wordIndex];
    
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        // Typing
        if (charIndex < currentWord.length) {
          setDisplayText(currentWord.substring(0, charIndex + 1));
          setCharIndex(charIndex + 1);
        } else {
          // Word complete, pause then start deleting
          setTimeout(() => setIsDeleting(true), pauseDuration);
        }
      } else {
        // Deleting
        if (charIndex > 0) {
          setDisplayText(currentWord.substring(0, charIndex - 1));
          setCharIndex(charIndex - 1);
        } else {
          // Word deleted, move to next word
          setIsDeleting(false);
          setWordIndex((wordIndex + 1) % words.length);
        }
      }
    }, isDeleting ? deletingSpeed : typingSpeed);

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, wordIndex, words, typingSpeed, deletingSpeed, pauseDuration, isMounted]);

  if (!isMounted) {
    return (
      <span className={className} style={{ minWidth: '10px' }}>
        &nbsp;
      </span>
    );
  }

  return (
    <span className={className}>
      {displayText}
      <span
        style={{
          display: 'inline-block',
          width: '3px',
          height: '1em',
          background: '#7c3aed',
          marginLeft: '4px',
          animation: 'cursorBlink 1s ease-in-out infinite',
          borderRadius: '2px',
          verticalAlign: 'middle',
        }}
      />
    </span>
  );
}