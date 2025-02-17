import { defaults } from 'lodash-es'
import Browser from 'webextension-polyfill'

export enum TriggerMode {
  Always = 'always',
  Manually = 'manually',
}

export const TRIGGER_MODE_TEXT = {
  [TriggerMode.Always]: { title: 'Always', desc: 'ArxivGPT is queried on every search' },
  [TriggerMode.Manually]: {
    title: 'Manually',
    desc: 'ArxivGPT is queried when you manually click a button',
  },
}

export enum Theme {
  Auto = 'auto',
  Light = 'light',
  Dark = 'dark',
}

export enum Language {
  Auto = 'auto',
  English = 'english',
  Chinese = 'chinese',
  Spanish = 'spanish',
  French = 'french',
  Korean = 'korean',
  Japanese = 'japanese',
  German = 'german',
  Portuguese = 'portuguese',
}

export const Prompt =
  'Please summarize the paper by author(s) in one concise sentence. \
 Then, list key insights and lessons learned from the paper.\
 Next, generate 3-5 questions that you would like to ask the authors about their work. \
 Finally, provide 3-5 suggestions for related topics or future research directions \
 based on the content of the paper. \
 If applicable, list at least 5 relevant references from the field of study of the paper. \
 '

export interface SitePrompt {
  site: string
  prompt: string
}

const userConfigWithDefaultValue = {
  triggerMode: TriggerMode.Always,
  theme: Theme.Auto,
  language: Language.Auto,
  prompt: Prompt,
  promptOverrides: [] as SitePrompt[],
}

export type UserConfig = typeof userConfigWithDefaultValue

export async function getUserConfig(): Promise<UserConfig> {
  const result = await Browser.storage.local.get(Object.keys(userConfigWithDefaultValue))
  return defaults(result, userConfigWithDefaultValue)
}

export async function updateUserConfig(updates: Partial<UserConfig>) {
  console.debug('update configs', updates)
  return Browser.storage.local.set(updates)
}

export enum ProviderType {
  ChatGPT = 'chatgpt',
  GPT3 = 'gpt3',
  LLAMA = 'llama',
}

interface GPT3ProviderConfig {
  model: string
  apiKey: string
}

export interface ProviderConfigs {
  provider: ProviderType
  configs: {
    [ProviderType.GPT3]: GPT3ProviderConfig | undefined
    [ProviderType.LLAMA]: GPT3ProviderConfig | undefined
  }
}

export async function getProviderConfigs(): Promise<ProviderConfigs> {
  const { provider = ProviderType.ChatGPT } = await Browser.storage.local.get('provider')
  const configKeyGPT = `provider:${ProviderType.GPT3}`
  const configKeyLLAMA = `provider:${ProviderType.LLAMA}`
  const resultGPT = await Browser.storage.local.get(configKeyGPT)
  const resultLLAMA = await Browser.storage.local.get(configKeyLLAMA)
  return {
    provider,
    configs: {
      [ProviderType.GPT3]: resultGPT[configKeyGPT],
      [ProviderType.LLAMA]: resultLLAMA[configKeyLLAMA],
    },
  }
}

export async function saveProviderConfigs(
  provider: ProviderType,
  configs: ProviderConfigs['configs'],
) {
  return Browser.storage.local.set({
    provider,
    [`provider:${ProviderType.GPT3}`]: configs[ProviderType.GPT3],
    [`provider:${ProviderType.LLAMA}`]: configs[ProviderType.LLAMA],
  })
}
