import {UseFormRegisterReturn} from "react-hook-form";
import React, {ChangeEvent, ReactNode, useRef} from "react";
import {InputGroup} from "@chakra-ui/react";

type FileUploadProps = {
    register: UseFormRegisterReturn
    accept?: string
    onChange: (event: ChangeEvent<HTMLInputElement>) => void
    multiple?: boolean
    children?: ReactNode
}

export const FileUpload = (props: FileUploadProps) => {
    const {register, accept, multiple, children, onChange} = props
    const inputRef = useRef<HTMLInputElement | null>(null)
    const {ref, ...rest} = register as { ref: (instance: HTMLInputElement | null) => void }

    const handleClick = () => inputRef.current?.click()

    return (
        <InputGroup onClick={handleClick}>
            <input
                type={'file'}
                multiple={multiple || false}
                hidden
                onInput={onChange}
                accept={accept}
                {...rest}
                ref={(e) => {
                    ref(e)
                    inputRef.current = e
                }}
            />
            <>
                {children}
            </>
        </InputGroup>
    )
}
