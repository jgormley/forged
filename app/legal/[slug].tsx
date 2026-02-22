import { View, Text, ScrollView } from 'react-native'
import { useMemo } from 'react'
import { router, useLocalSearchParams } from 'expo-router'
import Markdown from 'react-native-markdown-display'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'
import { Pressable } from '@/components/Pressable'
import { LEGAL_CONTENT } from '@/content/legal'
import type { LegalSlug } from '@/content/legal'

export default function LegalScreen() {
  const { slug }   = useLocalSearchParams<{ slug: string }>()
  const { theme }  = useUnistyles()
  const content    = LEGAL_CONTENT[slug as LegalSlug]

  const markdownStyles = useMemo(() => ({
    body: {
      fontFamily: theme.font.family.body,
      fontSize: theme.font.size.md,
      color: theme.colors.text,
      backgroundColor: theme.colors.surface,
    },
    paragraph: {
      marginBottom: theme.spacing.md,
      lineHeight: theme.font.size.md * theme.font.lineHeight.loose,
    },
    heading1: {
      fontFamily: theme.font.family.display,
      fontSize: theme.font.size.xxl,
      color: theme.colors.text,
      marginTop: theme.spacing.lg,
      marginBottom: theme.spacing.sm,
    },
    heading2: {
      fontFamily: theme.font.family.displayMedium,
      fontSize: theme.font.size.xl,
      color: theme.colors.text,
      marginTop: theme.spacing.xl,
      marginBottom: theme.spacing.sm,
    },
    heading3: {
      fontFamily: theme.font.family.bodySemiBold,
      fontSize: theme.font.size.lg,
      color: theme.colors.text,
      marginTop: theme.spacing.lg,
      marginBottom: theme.spacing.xs,
    },
    strong: {
      fontFamily: theme.font.family.bodyBold,
    },
    em: {
      fontFamily: theme.font.family.italic,
    },
    blockquote: {
      backgroundColor: theme.colors.accentSubtle,
      borderLeftWidth: 3,
      borderLeftColor: theme.colors.accent,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      marginBottom: theme.spacing.md,
      borderRadius: theme.radius.xs,
    },
    bullet_list: {
      marginBottom: theme.spacing.md,
    },
    ordered_list: {
      marginBottom: theme.spacing.md,
    },
    list_item: {
      marginBottom: theme.spacing.xs,
      lineHeight: theme.font.size.md * theme.font.lineHeight.loose,
    },
    hr: {
      backgroundColor: theme.colors.borderSubtle,
      height: 1,
      marginVertical: theme.spacing.lg,
    },
    code_inline: {
      fontFamily: 'Courier',
      fontSize: theme.font.size.sm,
      backgroundColor: theme.colors.overlayLight,
      borderRadius: theme.radius.xs,
      paddingHorizontal: 4,
    },
  }), [theme])

  if (!content) return null

  return (
    <View style={styles.root}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.dragHandle} />
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>{content.title}</Text>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Text style={styles.closeBtn}>Done</Text>
          </Pressable>
        </View>
      </View>

      {/* ── Content ── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Markdown style={markdownStyles}>
          {content.body}
        </Markdown>
      </ScrollView>

    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  root: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },

  header: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderSubtle,
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.borderSubtle,
    alignSelf: 'center',
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontFamily: theme.font.family.display,
    fontSize: theme.font.size.lg,
    color: theme.colors.text,
  },
  closeBtn: {
    fontFamily: theme.font.family.bodySemiBold,
    fontSize: theme.font.size.md,
    color: theme.colors.accent,
  },

  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xxxl,
  },
}))
