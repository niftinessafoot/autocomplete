import React, {
  ChangeEvent,
  forwardRef,
  KeyboardEvent,
  MouseEvent,
  ReactElement,
  Ref,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import './AutoComplete.scss';

interface DropdownProps {
  label?: string;
  componentClassName?: string;
  menuClassName?: string;
  buttonClassName?: string;
  inputClassName?: string;
  data?: string[];
  changeCallback?: Function;
}

interface MenuProps {
  setFieldValue: Function;
  children: string[];
  buttonClassName?: string;
  menuClassName?: string;
}

const Menu = forwardRef(
  (
    { setFieldValue, children, buttonClassName, menuClassName }: MenuProps,
    ref: Ref<HTMLMenuElement>
  ): ReactElement => {
    const affirmChange = (evt: MouseEvent<HTMLButtonElement>): void => {
      evt.preventDefault();
      const { currentTarget } = evt;
      setFieldValue(currentTarget.value);
    };

    return (
      !!children.length && (
        <menu ref={ref} className={menuClassName}>
          {children.map((entry: string): ReactElement => {
            return (
              <li key={entry}>
                <button
                  onClick={affirmChange}
                  value={entry}
                  className={buttonClassName}
                >
                  {entry}
                </button>
              </li>
            );
          })}
        </menu>
      )
    );
  }
);

Menu.displayName = 'Menu';

const AutoComplete = ({
  label,
  componentClassName = 'input-set',
  inputClassName,
  menuClassName,
  buttonClassName,
  data = [],
  changeCallback,
}: DropdownProps): ReactElement => {
  const initialIndex = -1;

  const labelRef = useRef<HTMLLabelElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLMenuElement>(null);
  const buttonsRef = useRef<NodeListOf<HTMLButtonElement>>(null);

  const [fieldValue, setFieldValue] = useState('');
  const [entries, setEntries] = useState<string[]>([]);
  const [focusIndex, setFocusIndex] = useState(initialIndex);

  const filterEntries = (state: string, entries: string[]): string[] => {
    const cleanState = state.replace(/[.*?+^${}()|[\]\\]/g, '\\$&');
    const regexp = new RegExp(cleanState, 'i');
    const filtered = entries.filter((ele) => ele.match(regexp));
    const exactMatch = filtered.includes(state) && filtered.length === 1;

    return !state || exactMatch ? [] : filtered;
  };

  const handleChange = (evt: ChangeEvent<HTMLInputElement>): void => {
    setFieldValue(evt.currentTarget.value);
  };

  const traverseList = (evt: KeyboardEvent<HTMLLabelElement>): void => {
    const canTraverse = ['ArrowDown', 'ArrowUp'].includes(evt.key);
    const len = entries.length;

    if (canTraverse) {
      let newIndex = focusIndex;
      newIndex = evt.key === 'ArrowDown' ? newIndex + 1 : newIndex - 1;
      newIndex = newIndex < initialIndex ? len - 1 : newIndex;
      newIndex = newIndex >= len ? initialIndex : newIndex;
      setFocusIndex(newIndex);
    }
  };

  useEffect(() => {
    const filtered = filterEntries(fieldValue, data);

    setEntries(filtered);
    setFocusIndex(initialIndex);
    if (typeof changeCallback === 'function') {
      changeCallback.call(null, inputRef.current);
    }
  }, [fieldValue]);

  useEffect(() => {
    if (focusIndex == initialIndex) {
      inputRef.current.focus();
    } else {
      const { current: buttons } = buttonsRef;
      buttons && buttons[focusIndex].focus();
    }
  }, [focusIndex]);

  useLayoutEffect(() => {
    buttonsRef.current = menuRef.current?.querySelectorAll('button');
  });

  return (
    <label className={componentClassName} ref={labelRef} onKeyUp={traverseList}>
      {label && <span>{label}</span>}
      <input
        type="text"
        ref={inputRef}
        value={fieldValue}
        onChange={handleChange}
        className={inputClassName}
      />
      <Menu
        ref={menuRef}
        setFieldValue={setFieldValue}
        menuClassName={menuClassName}
        buttonClassName={buttonClassName}
      >
        {entries}
      </Menu>
    </label>
  );
};

AutoComplete.displayName = 'AutoComplete';

export default AutoComplete;
