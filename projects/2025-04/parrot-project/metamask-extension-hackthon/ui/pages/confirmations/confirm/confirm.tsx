import { ReactNodeLike } from 'prop-types';
import React, { ReactNode, useCallback, useState, useEffect } from 'react';

import { Page } from '../../../components/multichain/pages/page';
import { GasFeeContextProvider } from '../../../contexts/gasFee';
import { TransactionModalContextProvider } from '../../../contexts/transaction-modal';
import AdvancedGasFeePopover from '../components/advanced-gas-fee-popover';
import { BlockaidLoadingIndicator } from '../components/confirm/blockaid-loading-indicator';
import { ConfirmAlerts } from '../components/confirm/confirm-alerts';
import { Footer } from '../components/confirm/footer';
import { Header } from '../components/confirm/header';
import { Info } from '../components/confirm/info';
import { LedgerInfo } from '../components/confirm/ledger-info';
import { SmartTransactionsBannerAlert } from '../components/smart-transactions-banner-alert';
import { PluggableSection } from '../components/confirm/pluggable-section';
import ScrollToBottom from '../components/confirm/scroll-to-bottom';
import { Title } from '../components/confirm/title';
import EditGasFeePopover from '../components/edit-gas-fee-popover';
import { ConfirmContextProvider, useConfirmContext } from '../context/confirm';
import { ConfirmNav } from '../components/confirm/nav/nav';
import { GasFeeTokenToast } from '../components/confirm/info/shared/gas-fee-token-toast/gas-fee-token-toast';
import { Splash } from '../components/confirm/splash';

// --- LLM Analysis Imports ---
import { LlmTransactionAnalysisService } from '../../../../shared/lib/llm-analysis-service';
import { formatTransactionForLLM } from '../utils/llm-analytics.util';
import { AnalysisButton } from '../components/llm-transaction-analysis/AnalysisButton';
import { AnalysisResult } from '../components/llm-transaction-analysis/AnalysisResult';
import ApiKeyConfigurationModal from '../components/llm-transaction-analysis/ApiKeyConfigurationModal';
import { AppError } from '../../../../shared/lib/errors';
// --- End LLM Analysis Imports ---

// Define a type for the analysis result state
type AnalysisData = {
  analysis: string;
  riskLevel: 'low' | 'medium' | 'high';
};

// --- End LLM Analysis Types ---

const EIP1559TransactionGasModal = () => {
  return (
    <>
      <EditGasFeePopover />
      <AdvancedGasFeePopover />
    </>
  );
};

const GasFeeContextProviderWrapper: React.FC<{
  children: ReactNode;
}> = ({ children }) => {
  const { currentConfirmation } = useConfirmContext();
  return (
    <GasFeeContextProvider transaction={currentConfirmation}>
      {children as NonNullable<ReactNodeLike>}
    </GasFeeContextProvider>
  );
};

const LlmAnalysisSection = () => {
  const { currentConfirmation } = useConfirmContext();
  const [analysisState, setAnalysisState] = useState<
    'idle' | 'loading' | 'done' | 'error'
  >('idle');
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);

  useEffect(() => {
    // Load API key from storage on component mount
    chrome.storage.local.get(['openRouterApiKey'], (result) => {
      if (result.openRouterApiKey) {
        setApiKey(result.openRouterApiKey);
      }
    });
  }, []);

  const handleAnalyzeClick = useCallback(async () => {
    if (!apiKey) {
      setIsModalOpen(true);
      return;
    }

    setAnalysisState('loading');
    setAnalysisData(null);

    try {
      const service = new LlmTransactionAnalysisService();
      const formattedData = formatTransactionForLLM(currentConfirmation);

      if (!formattedData) {
        setAnalysisState('error');
        setAnalysisData({
          analysis: 'This type of confirmation cannot be analyzed.',
          riskLevel: 'high',
        });
        return;
      }
      const result = await service.analyzeTransaction(formattedData);

      setAnalysisState('done');
      setAnalysisData(result);
    } catch (e) {
      setAnalysisState('error');
      const errorMessage =
        e instanceof AppError
          ? e.message
          : 'An unexpected error occurred during analysis.';
      setAnalysisData({ analysis: errorMessage, riskLevel: 'high' });
    }
  }, [currentConfirmation, apiKey]);

  const handleConfigureClick = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleModalSave = (newKey: string) => {
    setApiKey(newKey);
    // The modal itself handles saving to chrome.storage.local
  };

  return (
    <div style={{ padding: '0 16px' }}>
      <AnalysisButton
        onAnalyze={handleAnalyzeClick}
        onConfigure={handleConfigureClick}
        isLoading={analysisState === 'loading'}
      />
      {analysisData && (
        <AnalysisResult
          analysis={analysisData.analysis}
          riskLevel={analysisData.riskLevel}
        />
      )}
      <ApiKeyConfigurationModal
        open={isModalOpen}
        onClose={handleModalClose}
        onSave={handleModalSave}
      />
    </div>
  );
};

const Confirm = () => (
  <ConfirmContextProvider>
    <TransactionModalContextProvider>
      {/* This context should be removed once we implement the new edit gas fees popovers */}
      <GasFeeContextProviderWrapper>
        <EIP1559TransactionGasModal />
        <ConfirmAlerts>
          <Page className="confirm_wrapper">
            <ConfirmNav />
            <Header />
            <SmartTransactionsBannerAlert marginType="noTop" />
            <ScrollToBottom>
              <BlockaidLoadingIndicator />
              <LedgerInfo />
              <Title />
              <Info />
              <PluggableSection />
              <LlmAnalysisSection />
            </ScrollToBottom>
            <GasFeeTokenToast />
            <Footer />
            <Splash />
          </Page>
        </ConfirmAlerts>
      </GasFeeContextProviderWrapper>
    </TransactionModalContextProvider>
  </ConfirmContextProvider>
);

export default Confirm;
