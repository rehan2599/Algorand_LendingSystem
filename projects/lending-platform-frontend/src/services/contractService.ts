import algosdk from 'algosdk'
import { useWallet } from '@txnlab/use-wallet-react'

export const useContractService = () => {
  const { activeAddress, signTransactions } = useWallet()
  
  const algodClient = new algosdk.Algodv2(
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    'http://localhost',
    4001
  )
  
  const APP_ID = 1005 // Your deployed lending contract

  const callContract = async (method: string, args: any[] = []) => {
    if (!activeAddress) {
      throw new Error('Wallet not connected')
    }
    
    try {
      const suggestedParams = await algodClient.getTransactionParams().do()
      
      // Prepare application arguments
      const appArgs = [
        new Uint8Array(Buffer.from(method)),
        ...args.map(arg => {
          if (typeof arg === 'number') {
            return algosdk.encodeUint64(arg)
          }
          return new Uint8Array(Buffer.from(String(arg)))
        })
      ]
      
      // Create application call transaction
      const txn = algosdk.makeApplicationCallTxnFromObject({
        sender: activeAddress,
        suggestedParams,
        appIndex: APP_ID,
        onComplete: algosdk.OnApplicationComplete.NoOpOC,
        appArgs
      })
      
      // For demo purposes, simulate the transaction
      // In production, uncomment the lines below for real blockchain interaction
      
      /*
      // Real blockchain transaction (uncomment for production)
      const signedTxns = await signTransactions([txn])
      const result = await sendTransactions(signedTxns)
      
      // Wait for confirmation
      const confirmation = await algosdk.waitForConfirmation(
        algodClient, 
        result[0].txId, 
        4
      )
      
      return {
        txId: result[0].txId,
        confirmation,
        blockNumber: confirmation['confirmed-round'],
        success: true
      }
      */
      
      // Demo simulation
      console.log('Contract call prepared:', { method, args, appIndex: APP_ID })
      
      return {
        txId: 'ALG_' + Date.now().toString(36).toUpperCase(),
        blockNumber: Math.floor(Math.random() * 1000) + 8500,
        success: true,
        method,
        args,
        appIndex: APP_ID
      }
      
    } catch (error) {
      console.error('Contract call failed:', error)
      throw new Error(`Transaction failed: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
  
  const getContractState = async () => {
    try {
      const appInfo = await algodClient.getApplicationByID(APP_ID).do()
      return appInfo
    } catch (error) {
      console.error('Failed to get contract state:', error)
      return null
    }
  }
  
  const getAccountBalance = async (address: string) => {
    try {
      const accountInfo = await algodClient.accountInformation(address).do()
      return Number(accountInfo.amount) / 1000000 // Convert microALGO to ALGO
    } catch (error) {
      console.error('Failed to get balance:', error)
      return 0
    }
  }
  
  return { 
    callContract, 
    getContractState, 
    getAccountBalance,
    algodClient,
    isConnected: !!activeAddress,
    address: activeAddress
  }
}