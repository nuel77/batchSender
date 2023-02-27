import {Button, FormControl, FormErrorMessage, FormLabel, Icon, Input, Select} from '@chakra-ui/react'
import {useForm} from 'react-hook-form'
import {FiFile} from 'react-icons/fi'
import {FileUpload} from "./FileUpload";
import React, {useState} from "react";
import {ParticipantsTable} from "./ParticipantsTable";
import readXlsxFile from "read-excel-file";
import {useBatchSender} from "../hooks";
import {useApi} from "../hooks";
import {useWallet} from "../hooks";
import {Participant} from "../providers";

type FormValues = {
    file_: FileList
    batchNo: string
    selected: any
}

export const BetaRewardsForm = () => {
    const {register, handleSubmit, formState: {errors}} = useForm<FormValues>()
    const {accounts, selectAccount} = useWallet()
    const {updateBatchSize, updateParticipants, batchSendToParticipants} = useBatchSender()
    const [filename, setFilename] = useState<string | undefined>()
    const {IsApiInitialized} = useApi()
    const isReady: boolean = IsApiInitialized && !!filename

    const validateFiles = (value: FileList) => {
        if (value.length < 1) {
            return 'Files is required'
        }
        for (const file of Array.from(value)) {
            const fsMb = file.size / (1024 * 1024)
            const MAX_FILE_SIZE = 10
            if (fsMb > MAX_FILE_SIZE) {
                return 'Max file size 10mb'
            }
        }
        return true
    }
    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement> | undefined) => {
        if (!!e) {
            const file = e.target?.files?.[0]
            setFilename(file?.name)
            if (file) {
                readXlsxFile(file).then((rows) => {
                    const data: Participant[] = rows.slice(1).map(elem => {
                        return {
                            address: elem[0] as string,
                            amount: elem[1] as number,
                            status: "initialized"
                        }
                    })
                    updateParticipants?.(data)
                })
            }
        }
    }
    const onSubmit = handleSubmit(async (data) => {
        const {batchNo, selected, file_} = data
        const sender = accounts?.find((e) => e.name === selected)
        selectAccount?.(sender)
        updateBatchSize?.(Number(batchNo))
        batchSendToParticipants?.().finally(() => {
            alert("Done")
        })
    })
    return (
        <>
            <form onSubmit={onSubmit}>
                <FormControl isInvalid={!!errors.file_} isRequired>
                    <FormLabel>Select account from extension</FormLabel>
                    <Select placeholder=''
                            value={accounts?.[0]?.name}
                            id='batchNo'
                            {...register('selected', {
                                required: 'This is required',
                            })}>
                        {accounts.map((account) => {
                                return (<option key={account.address}>{account.name}</option>)
                            }
                        )}
                    </Select>
                    <FormLabel>{'File input'}</FormLabel>
                    <FileUpload
                        accept={'.xlsx'}
                        onChange={handleFileInputChange}
                        register={register('file_', {validate: validateFiles})}
                    >
                        <Button leftIcon={<Icon as={FiFile}/>}>
                            {filename ? filename : "Upload list of rewards (.xlsx)"}
                        </Button>
                    </FileUpload>
                    <FormLabel>Select batch size</FormLabel>
                    <Input
                        id='batchNo'
                        placeholder='Accounts per batch'
                        {...register('batchNo', {
                            required: 'This is required',
                        })}
                    />
                    <FormErrorMessage>
                        {errors.file_ && errors?.file_.message}
                    </FormErrorMessage>
                </FormControl>
                <Button
                    isDisabled={!isReady}
                    mt={4}
                    type="submit"
                >
                    {isReady ? "Send rewards" : "Loading..."}
                </Button>
                <ParticipantsTable
                />
            </form>
        </>
    )
}