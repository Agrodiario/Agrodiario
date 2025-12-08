import {
    useState,
    useRef,
    useEffect,
    ReactNode,
    cloneElement,
    ReactElement,
    
  } from 'react';
  import styles from './Dropdown.module.css';
  
  type DropdownProps = {
    trigger: ReactElement; 
    children: ReactNode; 
  };
  
  export function Dropdown({ trigger, children }: DropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null); 
  
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          wrapperRef.current &&
          !wrapperRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [wrapperRef]);
  
    const renderTrigger = () => {
        return cloneElement(trigger, {
          onClick: (e: MouseEvent) => {
            setIsOpen(!isOpen);
            trigger.props.onClick?.(e);
          },
        });
      };
  
    return (
      // Este wrapper agora tem "display: contents"
      <div className={styles.dropdownWrapper} ref={wrapperRef}>
        {renderTrigger()}
  
        {isOpen && (
          <div
            className={styles.dropdownContent}
            onClick={() => setIsOpen(false)}
          >
            {children}
          </div>
        )}
      </div>
    );
  }