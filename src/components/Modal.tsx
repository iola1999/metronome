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
          <ModalCloseButton onClick={onClose}>×</ModalCloseButton>
        </ModalHeader>
        {children}
      </ModalContent>
    </ModalWrapper>
  );
}; 