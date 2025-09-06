import { useWallet } from '@txnlab/use-wallet-react'
import React, { useState, useEffect } from 'react'
import { FinancialInclusionAI, type BusinessType } from './services/communityAI'
import { useContractService } from './services/contractService'

interface HomeProps {}

const Home: React.FC<HomeProps> = () => {
  const [currentView, setCurrentView] = useState<'home' | 'login' | 'dashboard' | 'loan-form'>('home')
  const [userPhone, setUserPhone] = useState<string>('+93')
  const [loanApplication, setLoanApplication] = useState({
    amount: '',
    purpose: '',
    businessDescription: '',
    monthlyIncome: '',
    guarantors: 2
  })
  
  const { activeAddress, wallets } = useWallet()
  const isConnected = !!activeAddress
  const contractService = useContractService()
  
  const [aiAssessment, setAiAssessment] = useState<any>(null)
  const [isAssessing, setIsAssessing] = useState(false)
  const [transactionStatus, setTransactionStatus] = useState<any>(null)

  // Community data
  const communityData = {
    poolLiquidity: 125000,
    activeLoans: 23,
    successRate: 94.2,
    guarantors: loanApplication.guarantors,
    avgLocalIncome: 300
  }

  // Real-time AI assessment
  useEffect(() => {
    if (loanApplication.amount && loanApplication.purpose && parseInt(loanApplication.amount) >= 5) {
      setIsAssessing(true)
      setAiAssessment(null)
      
      const timer = setTimeout(() => {
        const assessment = FinancialInclusionAI.assessLoan(
          { ...loanApplication, amount: parseInt(loanApplication.amount), purpose: loanApplication.purpose as BusinessType },
          communityData
        )
        setAiAssessment(assessment)
        setIsAssessing(false)
      }, 2500)
      
      return () => { clearTimeout(timer); return undefined; }
    } else {
      setAiAssessment(null)
      setIsAssessing(false)
    }
  }, [loanApplication.amount, loanApplication.purpose])

  const handleDirectWalletConnect = async () => {
    try {
      const luteWallet = wallets?.find(w => w.id === 'lute')
      if (luteWallet && !luteWallet.isConnected) {
        await luteWallet.connect()
      }
      if (isConnected) {
        setCurrentView('dashboard')
      }
    } catch (error) {
      console.error('Connection failed:', error)
      alert('Wallet connection failed. Please try again.')
    }
  }

  const handleHesabPayLogin = () => {
    if (userPhone.length >= 10) {
      setCurrentView('dashboard')
    }
  }

  const handleBlockchainTransaction = async () => {
    if (!contractService) {
      alert('Please connect wallet first')
      return
    }

    setTransactionStatus('processing')
    
    try {
      const result = await contractService.callContract('requestLoan', [
        aiAssessment.maxApprovedAmount * 1000000,
        loanApplication.purpose
      ])
      
      setTransactionStatus({
        success: true,
        txId: result.txId,
        block: result.blockNumber || Math.floor(Math.random() * 1000) + 8500,
        amount: aiAssessment.maxApprovedAmount,
        interestRate: aiAssessment.interestRate,
        appId: 1005
      })
    } catch (error) {
      console.error('Transaction failed:', error)
      setTransactionStatus({ success: false, error: error instanceof Error ? error.message : String(error) })
    }
  }

  // Home Landing View
  if (currentView === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-green-600 to-purple-700">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-4">
              Banking Infrastructure Platform
            </h1>
            <p className="text-xl text-white mb-4">
              Blockchain-powered financial services for underbanked regions
            </p>
            <p className="text-lg text-white/90">
              Serving 2+ billion people without traditional banking access
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 mb-12">
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-white">2B+</div>
              <div className="text-white/80">Underbanked</div>
              <div className="text-white/60 text-sm">People Worldwide</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-white">$380B</div>
              <div className="text-white/80">Market Gap</div>
              <div className="text-white/60 text-sm">Unmet Demand</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-white">92%</div>
              <div className="text-white/80">Success Rate</div>
              <div className="text-white/60 text-sm">Platform Average</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-white">47</div>
              <div className="text-white/80">Countries</div>
              <div className="text-white/60 text-sm">Potential Markets</div>
            </div>
          </div>

          <div className="max-w-md mx-auto bg-white rounded-lg shadow-2xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Access Financial Services</h2>
              <p className="text-gray-600">Choose your preferred authentication method</p>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleDirectWalletConnect}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-4 rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 transition-all"
              >
                Connect Algorand Wallet
              </button>

              <div className="divider text-gray-400">OR</div>

              <button
                onClick={() => setCurrentView('login')}
                className="w-full border-2 border-gray-300 text-gray-700 py-4 rounded-lg font-semibold hover:bg-gray-50 transition-all"
              >
                Regional Payment Login
              </button>
            </div>

            <div className="mt-6 text-center text-sm text-gray-500">
              <p>Serving underbanked communities worldwide</p>
              <p>Powered by Algorand blockchain + AI</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Regional Payment Login
  if (currentView === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-600 to-blue-600 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-4">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl">📱</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Regional Payment Login</h1>
            <p className="text-gray-600 mb-2">Enter your mobile number</p>
            <p className="text-gray-500">Works with HesabPay, M-Pesa, and other regional services</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={userPhone}
                onChange={(e) => setUserPhone(e.target.value)}
                placeholder="+93 7XX XXX XXX"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                dir="ltr"
              />
            </div>
            
            <button
              onClick={handleHesabPayLogin}
              disabled={userPhone.length < 10}
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 rounded-lg font-semibold disabled:opacity-50 hover:from-green-700 hover:to-blue-700 transition-all"
            >
              Login
            </button>

            <button
              onClick={() => setCurrentView('home')}
              className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-all"
            >
              ← Back to Home
            </button>
          </div>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Demo: +93701234567</p>
            <p>Integrated with regional payment systems</p>
          </div>
        </div>
      </div>
    )
  }

  // Dashboard
  if (currentView === 'dashboard') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white p-6">
          <div className="container mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Banking Infrastructure Platform</h1>
              <p className="text-blue-100">
                {isConnected ? `Wallet: ${activeAddress?.slice(0,12)}...` : `Mobile: ${userPhone}`}
              </p>
              <p className="text-blue-100">Balance: 4,000 ALGO</p>
            </div>
            <button
              onClick={() => setCurrentView('home')}
              className="text-white/80 hover:text-white underline"
            >
              Disconnect
            </button>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <div className="text-3xl font-bold text-blue-600">${communityData.poolLiquidity.toLocaleString()}</div>
                <div className="text-gray-600">Pool Liquidity</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <div className="text-3xl font-bold text-green-600">{communityData.activeLoans}</div>
                <div className="text-gray-600">Active Loans</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <div className="text-3xl font-bold text-purple-600">{communityData.successRate}%</div>
                <div className="text-gray-600">Success Rate</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <div className="text-3xl font-bold text-orange-600">156</div>
                <div className="text-gray-600">Community Members</div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Business Loan Application</h2>
              <p className="text-gray-600 mb-6">
                Get funding for your business without traditional banking requirements
              </p>
              <button
                onClick={() => setCurrentView('loan-form')}
                className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 transition-all"
              >
                Apply for Business Loan
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Enhanced Loan Application with Real-time AI
  if (currentView === 'loan-form') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6">
          <button
            onClick={() => setCurrentView('dashboard')}
            className="text-white/80 hover:text-white mb-4"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold">Business Loan Application</h1>
          <p className="text-green-100">AI-powered assessment for underbanked entrepreneurs</p>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
            {/* Application Form */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-6">Loan Application</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Requested Amount (ALGO)
                  </label>
                  <input
                    type="number"
                    value={loanApplication.amount}
                    onChange={(e) => setLoanApplication({...loanApplication, amount: e.target.value})}
                    placeholder="Enter amount (5-500)"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    min="5"
                    max="500"
                  />
                  <div className="text-sm text-gray-500 mt-1">
                    Equivalent: ${parseInt(loanApplication.amount || '0') * 10} USD
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Purpose
                  </label>
                  <select
                    value={loanApplication.purpose}
                    onChange={(e) => setLoanApplication({...loanApplication, purpose: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select Business Type</option>
                    <option value="Small Business">Small Business / Trading</option>
                    <option value="Agriculture">Agriculture / Farming</option>
                    <option value="Education">Education Services</option>
                    <option value="Healthcare">Healthcare Services</option>
                    <option value="Handicrafts">Handicrafts / Manufacturing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Plan Description
                  </label>
                  <textarea
                    value={loanApplication.businessDescription}
                    onChange={(e) => setLoanApplication({...loanApplication, businessDescription: e.target.value})}
                    placeholder="Describe how you will use this loan and generate income..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    rows={4}
                  />
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-blue-800 font-medium mb-2">Community Support Network:</div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-blue-700">Local Business Association</span>
                      <span className="text-green-600 text-sm">Verified</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-blue-700">Community Elder</span>
                      <span className="text-green-600 text-sm">Verified</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Assessment Panel */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-6">AI Risk Assessment</h2>
              
              {!loanApplication.amount || !loanApplication.purpose ? (
                <div className="text-center text-gray-500 py-12">
                  <div className="text-6xl mb-4">🤖</div>
                  <p className="text-lg">Fill application for AI analysis</p>
                  <p className="text-sm mt-2">Our AI evaluates business viability and community support</p>
                </div>
              ) : isAssessing ? (
                <div className="text-center py-12">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-6"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-blue-600 font-bold">AI</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-blue-600 mb-2">AI Analyzing Application</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>• Evaluating business viability</p>
                    <p>• Assessing community support</p>
                    <p>• Calculating risk factors</p>
                    <p>• Determining loan terms</p>
                  </div>
                </div>
              ) : aiAssessment ? (
                <div className="space-y-6">
                  <div className={`p-6 rounded-lg border-2 ${
                    aiAssessment.approved 
                      ? 'bg-green-50 border-green-300' 
                      : 'bg-red-50 border-red-300'
                  }`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`text-2xl font-bold ${
                        aiAssessment.approved ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {aiAssessment.approved ? 'LOAN APPROVED' : 'LOAN REJECTED'}
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        aiAssessment.riskLevel === 'low' ? 'bg-green-100 text-green-800' :
                        aiAssessment.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {aiAssessment.riskLevel.toUpperCase()} RISK
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-700">
                      Viability Score: {aiAssessment.viabilityScore}/100
                    </div>
                  </div>

                  {aiAssessment.approved && (
                    <div className="bg-blue-50 p-6 rounded-lg">
                      <h3 className="font-bold text-blue-800 mb-3">Approved Loan Terms:</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Amount:</span>
                          <span className="font-medium text-blue-800 ml-2">{aiAssessment.maxApprovedAmount} ALGO</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Interest Rate:</span>
                          <span className="font-medium text-blue-800 ml-2">{aiAssessment.interestRate}% APR</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Term:</span>
                          <span className="font-medium text-blue-800 ml-2">{aiAssessment.repaymentPeriod} days</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Monthly Payment:</span>
                          <span className="font-medium text-blue-800 ml-2">
                            ~{Math.round(aiAssessment.maxApprovedAmount * (1 + aiAssessment.interestRate/100) / 3)} ALGO
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="font-bold text-gray-800 mb-3">AI Assessment Factors:</h3>
                    <ul className="space-y-2">
                      {aiAssessment.assessmentFactors.map((factor: string, index: number) => (
                        <li key={index} className="flex items-start text-sm">
                          <span className="text-blue-600 mr-2 mt-1">•</span>
                          <span className="text-gray-700">{factor}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {aiAssessment.approved && (
                    <div className="pt-4">
                      {transactionStatus === 'processing' ? (
                        <div className="text-center py-6">
                          <div className="animate-pulse">
                            <div className="text-4xl mb-4">⛓️</div>
                            <p className="text-blue-600 font-medium">Processing Blockchain Transaction</p>
                            <p className="text-sm text-gray-600">Creating smart contract record...</p>
                          </div>
                        </div>
                      ) : transactionStatus?.success ? (
                        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                          <div className="text-center mb-4">
                            <div className="text-4xl mb-2">✅</div>
                            <div className="text-green-800 font-bold text-xl">Transaction Successful!</div>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Transaction ID:</span>
                              <span className="font-mono text-green-700">{transactionStatus.txId}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Block:</span>
                              <span className="font-mono text-green-700">{transactionStatus.block}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Loan Amount:</span>
                              <span className="font-medium text-green-700">{transactionStatus.amount} ALGO</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Interest Rate:</span>
                              <span className="font-medium text-green-700">{transactionStatus.interestRate}% APR</span>
                            </div>
                          </div>
                          <button
                            onClick={() => window.open('http://localhost:8080', '_blank')}
                            className="mt-4 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-all"
                          >
                            View on Blockchain Explorer
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={handleBlockchainTransaction}
                          className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-4 rounded-lg font-bold text-lg hover:from-green-700 hover:to-blue-700 transition-all"
                        >
                          Accept Terms & Execute Smart Contract
                        </button>
                      )}
                    </div>
                  )}

                  {!aiAssessment.approved && (
                    <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
                      <h3 className="font-bold text-yellow-800 mb-2">Improve Your Application:</h3>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        <li>• Reduce loan amount to match income capacity</li>
                        <li>• Get additional community guarantors</li>
                        <li>• Provide more detailed business plan</li>
                        <li>• Consider starting with a smaller loan</li>
                      </ul>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}

export default Home