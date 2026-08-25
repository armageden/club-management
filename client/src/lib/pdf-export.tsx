'use client';

import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { format } from 'date-fns';

// Register fonts (using built-in Helvetica for now)
Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxK.woff2', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmEU9fBBc4.woff2', fontWeight: 700 },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#1a1a2e',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    borderBottom: '2px solid #3b82f6',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a2e',
  },
  subtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginTop: 20,
    marginBottom: 10,
    borderBottom: '1px solid #e5e7eb',
    paddingBottom: 4,
  },
  table: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  tableHeader: {
    backgroundColor: '#f3f4f6',
    fontWeight: 'bold',
    padding: 8,
    border: '1px solid #e5e7eb',
  },
  tableCell: {
    padding: 8,
    border: '1px solid #e5e7eb',
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    flex: 1,
    padding: 6,
    border: '1px solid #e5e7eb',
  },
  label: {
    fontWeight: 'bold',
    color: '#374151',
  },
  value: {
    color: '#1f2937',
  },
  footer: {
    marginTop: 30,
    paddingTop: 10,
    borderTop: '1px solid #e5e7eb',
    fontSize: 8,
    color: '#9ca3af',
    textAlign: 'center',
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  kpiCard: {
    width: '48%',
    marginRight: '2%',
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    border: '1px solid #e5e7eb',
  },
  kpiLabel: {
    fontSize: 10,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginTop: 4,
  },
});

interface PDFExportOptions {
  title: string;
  subtitle?: string;
  filename?: string;
}

export function generatePDF(_content: React.ReactElement, _options: PDFExportOptions) {
  // This function would be called with a custom document component
  // For now, we provide template components below
}

export function PDFDocument({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>{title}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            <Text style={styles.subtitle}>Generated: {format(new Date(), 'MMMM d, yyyy HH:mm')}</Text>
          </View>
        </View>
        {children}
        <View style={styles.footer}>
          <Text>Hackathon Hub - Event Management Platform</Text>
        </View>
      </Page>
    </Document>
  );
}

export function PDFSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

export function PDFTable({
  headers,
  rows,
  columnWidths,
}: {
  headers: string[];
  rows: string[][];
  columnWidths?: number[];
}) {
  return (
    <View>
      <View style={styles.table}>
        {headers.map((header, index) => (
          <Text
            key={header}
            style={[
              styles.tableHeader,
              { width: columnWidths ? `${columnWidths[index]}%` : `${100 / headers.length}%` },
            ]}
          >
            {header}
          </Text>
        ))}
      </View>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.table}>
          {row.map((cell, cellIndex) => (
            <Text
              key={cellIndex}
              style={[
                styles.tableCell,
                { width: columnWidths ? `${columnWidths[cellIndex]}%` : `${100 / headers.length}%` },
              ]}
            >
              {cell}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
}

export function PDFKPIs({ items }: { items: Array<{ label: string; value: string | number; color?: string }> }) {
  return (
    <View style={styles.kpiGrid}>
      {items.map((item, index) => (
        <View key={index} style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>{item.label}</Text>
          <Text style={[styles.kpiValue, { color: item.color || '#1a1a2e' }]}>
            {item.value}
          </Text>
        </View>
      ))}
    </View>
  );
}

export function PDFKeyValue({ items }: { items: Array<{ label: string; value: string | number }> }) {
  return (
    <View>
      {items.map((item, index) => (
        <View key={index} style={styles.row}>
          <Text style={[styles.cell, styles.label]}>{item.label}</Text>
          <Text style={[styles.cell, styles.value]}>{item.value}</Text>
        </View>
      ))}
    </View>
  );
}

// Venue Map PDF Export
export function PDFVenueMap({
  title,
  locations,
  assignments,
}: {
  title: string;
  locations: Array<{ name: string; type: string; capacity: number; position_x: number; position_y: number; size_width: number; size_height: number }>;
  assignments: Array<{ location_name: string; team_name?: string; project_title?: string; starts_at: string; ends_at: string }>;
}) {
  return (
    <PDFDocument title={title} subtitle="Venue Layout & Assignments">
      <PDFSection title="Locations">
        <PDFTable
          headers={['Name', 'Type', 'Capacity', 'Position (X,Y)', 'Size (WxH)']}
          rows={locations.map(loc => [
            loc.name,
            loc.type.charAt(0).toUpperCase() + loc.type.slice(1),
            loc.capacity.toString(),
            `(${loc.position_x}, ${loc.position_y})`,
            `${loc.size_width} x ${loc.size_height}`,
          ])}
        />
      </PDFSection>

      <PDFSection title="Assignments">
        <PDFTable
          headers={['Location', 'Assigned To', 'Time']}
          rows={assignments.map(a => [
            a.location_name,
            a.team_name || a.project_title || '—',
            `${format(new Date(a.starts_at), 'MMM d, h:mm a')} - ${format(new Date(a.ends_at), 'h:mm a')}`,
          ])}
        />
      </PDFSection>
    </PDFDocument>
  );
}

// Leaderboard PDF Export
export function PDFLeaderboard({
  title,
  entries,
}: {
  title: string;
  entries: Array<{ rank: number; project: string; team: string; scores: { innovation: number; technical: number; presentation: number; usefulness: number; total: number }; judges: number }>;
}) {
  return (
    <PDFDocument title={title} subtitle="Judging Leaderboard">
      <PDFSection title="Rankings">
        <PDFTable
          headers={['Rank', 'Project', 'Team', 'Innovation', 'Technical', 'Presentation', 'Usefulness', 'Total', 'Judges']}
          rows={entries.map(e => [
            e.rank.toString(),
            e.project,
            e.team,
            e.scores.innovation.toFixed(1),
            e.scores.technical.toFixed(1),
            e.scores.presentation.toFixed(1),
            e.scores.usefulness.toFixed(1),
            e.scores.total.toFixed(1),
            e.judges.toString(),
          ])}
          columnWidths={[8, 25, 20, 10, 10, 10, 10, 10, 7]}
        />
      </PDFSection>
    </PDFDocument>
  );
}

// Hardware Inventory PDF Export
export function PDFHardwareInventory({
  title,
  items,
}: {
  title: string;
  items: Array<{ name: string; category: string; quantity: number; status: string; location: string }>;
}) {
  return (
    <PDFDocument title={title} subtitle="Hardware Inventory Report">
      <PDFSection title="Items">
        <PDFTable
          headers={['Name', 'Category', 'Available Qty', 'Status', 'Location']}
          rows={items.map(item => [
            item.name,
            item.category,
            item.quantity.toString(),
            item.status,
            item.location,
          ])}
        />
      </PDFSection>
    </PDFDocument>
  );
}