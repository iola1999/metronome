import { ReactNode } from "react";
import {
  Modal as ModalWrapper,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
} from "../styles/components/ModalStyles";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  const handleModalClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <ModalWrapper isOpen={isOpen} onClick={handleModalClick}>
      <ModalContent>
        <ModalHeader>
          <h2>{title}</h2>
          <ModalCloseButton onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </ModalCloseButton>
        </ModalHeader>
        {children}
      </ModalContent>
    </ModalWrapper>
  );
}; 