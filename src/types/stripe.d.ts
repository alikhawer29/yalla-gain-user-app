declare module '@stripe/stripe-react-native' {
  export interface StripeProviderProps {
    publishableKey: string;
    urlScheme?: string;
    merchantIdentifier?: string;
    children?: React.ReactNode;
  }

  export const StripeProvider: React.FC<StripeProviderProps>;

  export interface UseStripeResult {
    initPaymentSheet: (params: any) => Promise<any>;
    presentPaymentSheet: () => Promise<any>;
  }

  export const useStripe: () => UseStripeResult;
}
