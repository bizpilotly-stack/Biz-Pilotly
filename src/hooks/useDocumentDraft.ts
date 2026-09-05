import { useState, useEffect, useRef } from 'react';
import {
  BusinessDocument,
  DocumentType,
  loadDocumentDraft,
  saveDocumentDraft,
  clearDocumentDraft,
} from '../services/documents';

export interface UseDocumentDraftReturn {
  doc: BusinessDocument;
  setDoc: React.Dispatch<React.SetStateAction<BusinessDocument>>;
  isDraftSaved: boolean;
  lastSavedAt: Date | null;
  resetToTemplate: () => void;
  saveNow: () => boolean;
}

export function useDocumentDraft(documentType: DocumentType): UseDocumentDraftReturn {
  const [doc, setDoc] = useState<BusinessDocument>(() => loadDocumentDraft(documentType));
  const [isDraftSaved, setIsDraftSaved] = useState<boolean>(true);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(new Date());
  const debounceTimerRef = useRef<number | null>(null);

  // Auto-save on state mutation
  useEffect(() => {
    setIsDraftSaved(false);
    if (debounceTimerRef.current) {
      window.clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = window.setTimeout(() => {
      const success = saveDocumentDraft(documentType, doc);
      if (success) {
        setIsDraftSaved(true);
        setLastSavedAt(new Date());
      }
    }, 400);

    return () => {
      if (debounceTimerRef.current) {
        window.clearTimeout(debounceTimerRef.current);
      }
    };
  }, [doc, documentType]);

  const resetToTemplate = () => {
    const fresh = clearDocumentDraft(documentType);
    setDoc(fresh);
    setIsDraftSaved(true);
    setLastSavedAt(new Date());
  };

  const saveNow = () => {
    const success = saveDocumentDraft(documentType, doc);
    if (success) {
      setIsDraftSaved(true);
      setLastSavedAt(new Date());
    }
    return success;
  };

  return {
    doc,
    setDoc,
    isDraftSaved,
    lastSavedAt,
    resetToTemplate,
    saveNow,
  };
}
