const selectStyles = {
  control: (base) => ({
    ...base,
    backgroundColor: '#2c2c3c',
    borderColor: '#555',
    color: '#fff',
    minHeight: '38px',
     height: '38px',
    width: '220px',
    fontSize: '13px',
    boxShadow: 'none',
    '&:hover': {
      borderColor: '#777',
    },
  }),
  singleValue: (base) => ({
    ...base,
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: '#1e1e2f',
    color: '#fff',
    width: '220px',
    zIndex: 9999,
    overflow: 'visible',
    borderRadius: '6px',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.6)',
  }),
  menuList: (base) => ({
    ...base,
    maxHeight: '180px',
    overflowY: 'auto',
    padding: 0,
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused
      ? '#333'
      : state.isSelected
      ? '#444'
      : '#1e1e2f',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    cursor: 'pointer',
    fontWeight: state.isSelected ? 'bold' : 'normal',
  }),
  placeholder: (base) => ({
    ...base,
    color: '#aaa',
    fontSize: '13px',
  }),
  input: (base) => ({
    ...base,
    color: '#fff',
  }),
  dropdownIndicator: (base) => ({
    ...base,
    color: '#aaa',
    '&:hover': {
      color: '#ffcc00',
    },
  }),
  indicatorSeparator: () => ({
    display: 'none',
  }),
};

export default selectStyles;
