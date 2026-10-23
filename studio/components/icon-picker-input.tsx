import { useMemo, useState } from 'react'
import { set, unset, type StringInputProps } from 'sanity'
import { Box, Button, Card, Flex, Grid, Stack, Text, TextInput } from '@sanity/ui'
import { Tooltip } from '@sanity/ui/tooltip'
import { MENU_ICONS } from './menu-icons'

/** A grid of the menu icons. Click one to choose it, click it again to clear. */
export function IconPickerInput(props: StringInputProps) {
  const { value, onChange, readOnly } = props
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase()
    const out = new Map<string, Array<[string, (typeof MENU_ICONS)[string]]>>()
    for (const entry of Object.entries(MENU_ICONS)) {
      const [name, def] = entry
      if (q && !`${name} ${def.title} ${def.group}`.toLowerCase().includes(q)) continue
      out.set(def.group, [...(out.get(def.group) ?? []), entry])
    }
    return [...out.entries()]
  }, [query])

  const current = value ? MENU_ICONS[value] : undefined
  const Current = current?.icon

  return (
    <Stack gap={3}>
      <Flex align="center" gap={3}>
        <Card radius={2} tone={current ? 'primary' : 'transparent'} border style={{ width: 44, height: 44, display: 'grid', placeItems: 'center' }}>
          {Current ? <Current size={26} weight="fill" /> : <Text muted size={1}>None</Text>}
        </Card>
        <Box flex={1}>
          <Text size={1} weight="medium">{current?.title ?? 'No icon'}</Text>
        </Box>
        <Button mode="ghost" text={open ? 'Done' : current ? 'Change' : 'Choose icon'} onClick={() => setOpen((o) => !o)} disabled={readOnly} />
        {current && <Button mode="bleed" tone="critical" text="Remove" onClick={() => onChange(unset())} disabled={readOnly} />}
      </Flex>

      {open && (
        <Card padding={3} radius={2} border>
          <Stack gap={4}>
            <TextInput placeholder="Search icons" value={query} onChange={(e) => setQuery(e.currentTarget.value)} />
            {groups.map(([group, items]) => (
              <Stack key={group} gap={2}>
                <Text size={0} weight="semibold" muted style={{ textTransform: 'uppercase', letterSpacing: '.06em' }}>{group}</Text>
                <Grid gridTemplateColumns={[6, 8, 10]} gap={1}>
                  {items.map(([name, def]) => {
                    const Icon = def.icon
                    const selected = value === name
                    return (
                      <Tooltip key={name} content={<Box padding={2}><Text size={1}>{def.title}</Text></Box>} placement="top" portal>
                        <Button
                          mode={selected ? 'default' : 'bleed'}
                          tone={selected ? 'primary' : 'default'}
                          padding={2}
                          aria-label={def.title}
                          aria-pressed={selected}
                          onClick={() => {
                            onChange(selected ? unset() : set(name))
                            if (!selected) setOpen(false)
                          }}
                        >
                          <Flex justify="center"><Icon size={24} weight="fill" /></Flex>
                        </Button>
                      </Tooltip>
                    )
                  })}
                </Grid>
              </Stack>
            ))}
            {groups.length === 0 && <Text muted size={1}>No icons match “{query}”.</Text>}
          </Stack>
        </Card>
      )}
    </Stack>
  )
}

/** Small icon for list previews in the Studio. */
export function iconMedia(name?: string) {
  const def = name ? MENU_ICONS[name] : undefined
  if (!def) return undefined
  const Icon = def.icon
  return <Icon weight="fill" />
}
