"use client";

import React, { useMemo } from "react";
import Select from "react-select";

type Option = { value: string; label: string };

const customStyles: any = {
  menuPortalTarget: typeof document !== "undefined" ? document.body : undefined,
};


export default function LanguagesMultiSelect({
  value,
  onChange,
  options,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  options: string[];
}) {
  const opts: Option[] = useMemo(
    () => options.map((l) => ({ value: l, label: l })),
    [options],
  );

  const selected: Option[] = useMemo(
    () => value.map((v) => ({ value: v, label: v })).filter((o) => opts.some((x) => x.value === o.value)),
    [value, opts],
  );

  return (
    <Select<Option, true>
      isMulti
      options={opts}
      value={selected}
      onChange={(next) => {
        const arr = (next ?? []).map((x) => x.value);
        onChange(arr);
      }}
      placeholder="Choisir des langues..."
      closeMenuOnSelect={false}
      hideSelectedOptions={false}
      isClearable={false}
      classNamePrefix="react-select"
      menuPortalTarget={typeof document !== "undefined" ? document.body : undefined}
      menuPosition="fixed"
      menuShouldBlockScroll={false}
      styles={{
        menuPortal: (base) => ({ ...base, zIndex: 10000 }),
        menu: (base) => ({ ...base, zIndex: 10000 }),
        control: (base, state) => ({
          ...base,
          borderColor: state.isFocused ? "#60894B" : "#d1d5db",
          boxShadow: state.isFocused ? "0 0 0 2px rgba(96,137,75,0.25)" : base.boxShadow,
          minHeight: 44,
          '&:hover': {
            borderColor: "#60894B",
          },
        }),
        multiValue: (base) => ({
          ...base,
          backgroundColor: "rgba(96,137,75,0.08)",
          border: "1px solid rgba(96,137,75,0.25)",
        }),
        multiValueLabel: (base) => ({
          ...base,
          color: "#60894B",
        }),
        multiValueRemove: (base) => ({
          ...base,
          color: "#60894B",
          ':hover': {
            backgroundColor: "rgba(96,137,75,0.12)",
            color: "#60894B",
          },
        }),
        option: (base, state) => ({
          ...base,
          backgroundColor: state.isSelected
            ? "rgba(96,137,75,0.12)"
            : state.isFocused
              ? "rgba(96,137,75,0.08)"
              : base.backgroundColor,
          color: "#111827",
        }),
      }}
    />
  );
}

