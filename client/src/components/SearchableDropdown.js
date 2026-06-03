import React, { useState, useEffect, useMemo } from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';
import { debounce } from 'lodash';

function SearchableDropdown({
  options,
  label,
  placeholder,
  value,
  onChange,
  required = false,
  disabled = false,
  loading: externalLoading = false,
  error = false,
  helperText = '',
  getOptionLabel = (option) => {
    if (typeof option === 'string') return option;
    return option.name || option;
  },
  renderOption = null
}) {
  const [inputValue, setInputValue] = useState('');
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ FIX: useMemo instead of useCallback
  const filterOptions = useMemo(() => {
    return debounce((searchTerm) => {
      setLoading(true);

      setTimeout(() => {
        if (!searchTerm) {
          setFilteredOptions(options.slice(0, 50));
        } else {
          const filtered = options.filter(option => {
            const optionLabel =
              typeof option === 'string' ? option : option.name;

            return optionLabel
              .toLowerCase()
              .includes(searchTerm.toLowerCase());
          });

          setFilteredOptions(filtered.slice(0, 100));
        }

        setLoading(false);
      }, 300);
    }, 300);
  }, [options]);

  useEffect(() => {
    filterOptions(inputValue);

    return () => {
      filterOptions.cancel();
    };
  }, [inputValue, filterOptions]);

  return (
    <Autocomplete
      freeSolo
      options={filteredOptions}
      value={value}
      onChange={(event, newValue) => {
        if (onChange) onChange(newValue);
      }}
      inputValue={inputValue}
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue);
      }}
      loading={loading || externalLoading}
      disabled={disabled}
      getOptionLabel={getOptionLabel}
      renderOption={renderOption}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          required={required}
          error={error}
          helperText={helperText}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {(loading || externalLoading) && (
                  <CircularProgress color="inherit" size={20} />
                )}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      noOptionsText="No items found. Type to search..."
      ListboxProps={{
        style: { maxHeight: 300 },
      }}
    />
  );
}

export default SearchableDropdown;