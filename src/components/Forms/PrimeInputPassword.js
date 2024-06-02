
import React from "react";
import { Password } from 'primereact/password';
import { Controller} from 'react-hook-form';
import { classNames } from 'primereact/utils';



export function PrimeInputPass({ name, mb, mt, control,error, label,  }) {

    return (
            <Controller
                    name={name}
                    control={control}
                    render={({ field, fieldState }) => (
                        <>
                            <label className="custom_label" htmlFor={field.name} >
                                {label}
                            </label>
                            <Password 
                                feedback={false}
                                toggleMask
                                id={field.name} 
                                value={field.value}
                                inputRef={field.ref} 
                                style={{ width: '100%' }}
                                onChange={(e) => field.onChange(e.target.value)}
                                className={`custom_input ${classNames({ 'p-invalid': fieldState.error })}` }
                                 />
                        </>
                    )}
                />
    )
}
