import {Button, FormControl, FormErrorMessage, FormLabel, Icon, Input, Select} from '@chakra-ui/react'
import {useForm} from 'react-hook-form'
import {FiFile} from 'react-icons/fi'
import {FileUpload} from "./FileUpload";
import {web3Accounts, web3Enable, web3EnablePromise, web3FromAddress} from '@polkadot/extension-dapp';
import React, {useEffect, useState} from "react";
import {ParticipantsTable} from "./ParticipantsTable";
import readXlsxFile from "read-excel-file";
import {Participants, useBatchTransactions} from "../hooks/useBatchTransactions";
import {useApi} from "../hooks/useApi";
import {cryptoWaitReady} from "@polkadot/util-crypto";

type FormValues = {
    file_: FileList
    batchNo: string

    selected: any
}

export type Account = {
    address: string,
    name?: string,
    injector: any
}
export const BetaRewardsForm = () => {
    const {register, handleSubmit, formState: {errors}} = useForm<FormValues>()
    const {batchSendToParticipants} = useBatchTransactions()
    const [accounts, setAccounts] = useState<Account[]>([])
    const [batchSize, setBatchSize] = useState<number>(-1)
    const [filename, setFilename] = useState<string | undefined>()
    const [participants, setParticipants] = useState<Participants[]>([])
    const [sentBatchIndex, setSentBatchIndex] = useState<number>(-1)
    const [failedBatchIndex, setFailedBatchIndex] = useState<number>(-1)
    const [loadingBatchIndex, setLoadingBatchIndex] = useState<number>(-1)
    const [isSendingRewards, setIsSendingRewards] = useState(false)
    const {IsApiInitialized} = useApi()
    const [seedPhrase, setSeedPhrase] = useState<string>("")
    const isReady: boolean = IsApiInitialized && !!filename && !isSendingRewards
    const pushToLoadingAccounts = (a: number) => {
        console.log("loading", a)
        setLoadingBatchIndex(a)
    }
    const pushToSentAccounts = (a: number) => {
        console.log("sent", a)
        setSentBatchIndex(a)
    }
    const pushToFailedAccounts = (a: number) => {
        console.log("failed", a)
        setFailedBatchIndex(a)
    }
    const deleteAccount = (a: string) => {
        const accounts = participants.filter(e => e.address !== a)
        setParticipants(accounts)
    }

    useEffect(() => {
        const init = async () => {
            await cryptoWaitReady()
            await web3Enable('polkadex-internal');
            await web3EnablePromise
            const allAccounts = await web3Accounts();
            const accountPromises = allAccounts.map(async (account) => {
                const injector = await web3FromAddress(account.address);
                return {
                    address: account.address,
                    name: account.meta.name,
                    injector,
                }
            })
            const accounts = await Promise.all(accountPromises)
            setAccounts(accounts)
        }
        init().then(console.log)
    }, [])
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
                    const data: Participants[] = rows.slice(1).map(elem => {
                        return {
                            address: elem[0] as string,
                            amount: elem[1] as number
                        }
                    })
                    setParticipants(data)
                })
            }
        }
    }
    const onSubmit = handleSubmit(async (data) => {
        setIsSendingRewards(true)
        const {batchNo, selected, file_} = data
        const sender = accounts?.find((e) => e.name === selected)
        setBatchSize(Number(batchNo))
        batchSendToParticipants({
            accounts: participants,
            pushToFailedAccounts,
            pushToSentAccounts,
            pushToLoadingAccounts,
            seedPhrase,
            batchSize: Number(batchNo),
            sender
        }).finally(() => setIsSendingRewards(false))
    })
    return (
        <>
            <form onSubmit={onSubmit}>
                <FormControl isInvalid={!!errors.file_} isRequired>
                    <FormLabel>Select account from extension</FormLabel>
                    <Select placeholder=''
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
                    accounts={participants}
                    sentBatchIndex={sentBatchIndex}
                    loadingBatchIndex={loadingBatchIndex}
                    failedBatchIndex={failedBatchIndex}
                    deleteAccount={deleteAccount}
                    batchSize={batchSize}
                />
            </form>
        </>
    )
}