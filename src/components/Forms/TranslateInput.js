
import React from 'react';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import axios from 'axios';
import Link from 'next/link';


export const TranslateInput = ({ textArea =false , label,name, state, handleState, targetLang }) => {
        
    const handleTranslate = async () => {
        let {data} = await axios.post('/api/deepL', { text: state, targetLang: targetLang })
        handleState(data.translatedText, name)
    }

    const onChange = (e) => {
        const {name, value} = e.target
        handleState(value, name)
    }
    
    return (
        <div >
            <label className='custom_label' >
                {label}
            </label>
            <div >
                {textArea ? (
                     <InputTextarea
                     name={name}
                     rows={1}
                     autoResize={true}
                     value={state}
                     onChange={onChange}
                 />
                ) : (
                    <InputText
                    name={name}
                    value={state}
                    onChange={onChange}
                />
                )}
                <Link 
                    className='translate_btn' 
                    href="#"
                    onClick={handleTranslate} 
                >
                    Μετάφραση
                </Link>
              
            </div>
        </div>
    );
};





