import { Autocomplete, Checkbox, Chip, TextField } from '@mui/material';

export function MultiItemSelector<T>({
  selectedValues,
  allValues,
  label,
  onUpdate,
}: {
  selectedValues: T[];
  allValues: { value: T; title: string }[];
  label: string;
  onUpdate: (value: T[]) => void;
}) {
  return (
    <Autocomplete
      multiple
      id={`${label}-filter`}
      options={allValues}
      isOptionEqualToValue={(option, value) => option.value === value.value}
      disableCloseOnSelect
      getOptionLabel={(option) => option.title}
      limitTags={2}
      value={selectedValues.map((v) => allValues.find((a) => a.value === v))}
      onChange={(e, newValue) => {
        onUpdate(newValue.map((v) => v.value));
      }}
      renderOption={(props, option, { selected }) => {
        const { key, ...optionProps } = props;
        return (
          <li key={key} {...optionProps}>
            <Checkbox checked={selected} />
            {option.title
              ? /*mmtHTMLToReact(option.title)*/ 'TODO ALEA4-P4'
              : (option.value ?? 'unset').toString()}
          </li>
        );
      }}
      renderTags={(value, getTagProps) => {
        return value.map((option, index) => (
          <Chip
            key={index}
            {...getTagProps({ index })}
            label={
              option.title
                ? /*mmtHTMLToReact(option.title)*/ 'TODO ALEA4-P4'
                : option.value.toString().substring(0, 30)
            }
          />
        ));
      }}
      renderInput={(params) => <TextField {...params} label={label} />}
      sx={{ minWidth: 300 }}
    />
  );
}
