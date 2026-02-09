/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires */
import { TransactionEnvelopeType } from '@metamask/transaction-controller';
import { DAPP_URL } from '../../../constants';
import {
  unlockWallet,
  veryLargeDelayMs,
  WINDOW_TITLES,
} from '../../../helpers';
import { MockedEndpoint, Mockttp } from '../../../mock-e2e';
import TokenTransferTransactionConfirmation from '../../../page-objects/pages/confirmations/redesign/token-transfer-confirmation';
import TestDapp from '../../../page-objects/pages/test-dapp';
import { Driver } from '../../../webdriver/driver';
import { withTransactionEnvelopeTypeFixtures } from '../helpers';
import { TestSuiteArguments } from './shared';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

async function mockLlmApi(
  mockServer: Mockttp,
  { success }: { success: boolean },
): Promise<MockedEndpoint[]> {
  const mock = await mockServer.forPost(OPENROUTER_API_URL).thenCallback(() => {
    if (success) {
      return {
        statusCode: 200,
        json: {
          choices: [
            {
              message: {
                content:
                  '{"analysis":"This is a mock analysis.","riskLevel":"low"}',
              },
            },
          ],
        },
      };
    }
    return {
      statusCode: 500,
      json: { error: 'Internal Server Error' },
    };
  });
  return [mock];
}

describe('Confirmation LLM Analysis', function () {
  it('displays analysis when LLM call is successful', async function () {
    await withTransactionEnvelopeTypeFixtures(
      this.test?.fullTitle(),
      TransactionEnvelopeType.feeMarket, // Use a modern transaction type
      async ({ driver }: TestSuiteArguments) => {
        await createDAppInitiatedTransactionAndAssertAnalysis(driver, {
          success: true,
        });
      },
      (mockServer) => mockLlmApi(mockServer, { success: true }),
    );
  });

  it('displays an error when LLM call fails', async function () {
    await withTransactionEnvelopeTypeFixtures(
      this.test?.fullTitle(),
      TransactionEnvelopeType.feeMarket,
      async ({ driver }: TestSuiteArguments) => {
        await createDAppInitiatedTransactionAndAssertAnalysis(driver, {
          success: false,
        });
      },
      (mockServer) => mockLlmApi(mockServer, { success: false }),
    );
  });
});

async function createDAppInitiatedTransactionAndAssertAnalysis(
  driver: Driver,
  mockOptions: { success: boolean },
) {
  await unlockWallet(driver);

  const testDapp = new TestDapp(driver);
  await testDapp.openTestDappPage({ contractAddress: null, url: DAPP_URL });
  await driver.switchToWindowWithTitle(WINDOW_TITLES.TestDApp);
  await testDapp.clickSimpleSendButton();
  await driver.delay(veryLargeDelayMs);
  await driver.switchToWindowWithTitle(WINDOW_TITLES.Dialog);

  const tokenTransferTransactionConfirmation =
    new TokenTransferTransactionConfirmation(driver);

  await tokenTransferTransactionConfirmation.clickLlmAnalysisButton();

  if (mockOptions.success) {
    await tokenTransferTransactionConfirmation.check_llmAnalysisResultIsVisible();
  } else {
    // Note: The exact error message depends on the UI implementation
    // We assume a generic error for now.
    await tokenTransferTransactionConfirmation.check_llmAnalysisErrorIsVisible();
  }

  await tokenTransferTransactionConfirmation.clickFooterConfirmButton();
}