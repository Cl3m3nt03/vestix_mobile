import * as Haptics from 'expo-haptics'

/**
 * Retours haptiques — wrappers fins sur expo-haptics.
 * Toujours « fire-and-forget » : on n'attend jamais, et on avale les
 * erreurs (simulateur / appareil sans moteur haptique) pour ne jamais
 * casser l'UI à cause d'une vibration.
 */
const safe = (p: Promise<void>) => {
  p.catch(() => {})
}

/** Tap léger — sélection d'onglet, chips, toggles. */
export const tapLight = () =>
  safe(Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light))

/** Appui medium — boutons d'action principaux. */
export const tapMedium = () =>
  safe(Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium))

/** Sélection — passage d'un élément à l'autre (pickers, segments). */
export const select = () => safe(Haptics.selectionAsync())

/** Succès — opération réussie (ajout, sauvegarde). */
export const success = () =>
  safe(Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success))

/** Erreur — échec d'une opération. */
export const error = () =>
  safe(Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error))

/** Avertissement. */
export const warning = () =>
  safe(Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning))
