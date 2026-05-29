import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Pressable, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { useAuth } from '@/context/AuthContext';
import { AppTheme } from '@/constants/Theme';
import { formatWing } from '@/constants/Wings';
import { updateParentProfile } from '@/services/api';
import type { EmergencyContact, ParentChildSummary } from '@/types';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function ParentProfileScreen() {
  const { user, children: linkedChildren, updateUser } = useAuth();

  if (!user) return null;

  // Local Form State
  const [phone, setPhone] = useState(user.phone || '');
  const [address, setAddress] = useState(user.address || '');
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>(
    user.emergencyContacts || []
  );

  // Modal / Inline Form State for Emergency Contacts
  const [showContactForm, setShowContactForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [contactName, setContactName] = useState('');
  const [contactRelation, setContactRelation] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  const [saving, setSaving] = useState(false);

  const handleOpenContactForm = (index: number | null = null) => {
    if (index !== null) {
      // Editing
      const contact = emergencyContacts[index];
      setContactName(contact.name);
      setContactRelation(contact.relationship);
      setContactPhone(contact.phone);
      setEditingIndex(index);
    } else {
      // Adding
      setContactName('');
      setContactRelation('');
      setContactPhone('');
      setEditingIndex(null);
    }
    setShowContactForm(true);
  };

  const handleSaveContact = () => {
    if (!contactName.trim() || !contactRelation.trim() || !contactPhone.trim()) {
      Alert.alert('Error', 'Please fill out all emergency contact fields.');
      return;
    }

    const newContact: EmergencyContact = {
      name: contactName.trim(),
      relationship: contactRelation.trim(),
      phone: contactPhone.trim(),
    };

    if (editingIndex !== null) {
      // Edit existing
      const updated = [...emergencyContacts];
      updated[editingIndex] = newContact;
      setEmergencyContacts(updated);
    } else {
      // Add new
      setEmergencyContacts([...emergencyContacts, newContact]);
    }

    setShowContactForm(false);
    setEditingIndex(null);
  };

  const handleDeleteContact = (index: number) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to remove this emergency contact?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updated = emergencyContacts.filter((_, i) => i !== index);
            setEmergencyContacts(updated);
          },
        },
      ]
    );
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const updatedUser = await updateParentProfile(user, phone, address, emergencyContacts);
      updateUser(updatedUser);
      Alert.alert('Success', 'Profile updated successfully.');
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'Active':
        return AppTheme.success;
      case 'Inactive':
        return AppTheme.textMuted;
      case 'Graduated':
        return '#3b82f6';
      case 'Transferred':
        return AppTheme.warning;
      case 'Dropped':
        return AppTheme.danger;
      default:
        return AppTheme.success;
    }
  };

  return (
    <Screen loading={false} scroll embedded>
      <View style={styles.container}>
        <View style={styles.leftCol}>
          {/* Parent Info Edit Card */}
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Parent Profile Details</Text>
            
            <FormField label="Full Name">
              <TextInput style={[styles.input, styles.disabledInput]} value={user.name} editable={false} />
            </FormField>
            
            <FormField label="Email Address">
              <TextInput style={[styles.input, styles.disabledInput]} value={user.email} editable={false} />
            </FormField>

            <FormField label="Contact Phone Number">
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="e.g. 9876543210"
                keyboardType="phone-pad"
              />
            </FormField>

            <FormField label="Residential Address">
              <TextInput
                style={[styles.input, styles.textArea]}
                value={address}
                onChangeText={setAddress}
                placeholder="Enter complete residential address"
                multiline
                numberOfLines={3}
              />
            </FormField>

            <Button
              title="Save Profile Details"
              loading={saving}
              onPress={handleSaveProfile}
              style={{ marginTop: 12 }}
            />
          </Card>

          {/* Sibling Student Mapping Card */}
          <Text style={styles.sectionTitle}>Registered Children ({linkedChildren.length})</Text>
          {linkedChildren.map((child) => (
            <Card key={child.id} style={styles.childCard}>
              <View style={styles.childHeader}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {child.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .substring(0, 2)}
                  </Text>
                </View>
                <View style={styles.childInfo}>
                  <Text style={styles.childName}>{child.name}</Text>
                  <Text style={styles.childMeta}>
                    Class: Gr {child.grade} {child.className || ''} ({child.section || '—'})
                  </Text>
                  <Text style={styles.childMeta}>Wing: {formatWing(child.wing)}</Text>
                  <Text style={styles.childMeta}>Admission Number: {child.id}</Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor: `${getStatusColor('Active')}15`,
                      borderColor: getStatusColor('Active'),
                    },
                  ]}
                >
                  <Text style={[styles.statusText, { color: getStatusColor('Active') }]}>Active</Text>
                </View>
              </View>
            </Card>
          ))}
        </View>

        <View style={styles.rightCol}>
          {/* Emergency Contacts Card */}
          <Card style={styles.card}>
            <View style={styles.contactsHeader}>
              <Text style={styles.cardTitle}>Emergency Contacts</Text>
              {!showContactForm ? (
                <Pressable onPress={() => handleOpenContactForm(null)} style={styles.addBtn}>
                  <FontAwesome name="plus" size={12} color={AppTheme.accent} />
                  <Text style={styles.addBtnText}>Add</Text>
                </Pressable>
              ) : null}
            </View>

            {showContactForm ? (
              <View style={styles.contactForm}>
                <Text style={styles.contactFormTitle}>
                  {editingIndex !== null ? 'Edit Emergency Contact' : 'New Emergency Contact'}
                </Text>

                <FormField label="Full Name">
                  <TextInput
                    style={styles.input}
                    value={contactName}
                    onChangeText={setContactName}
                    placeholder="e.g. Kavitha Mehta"
                  />
                </FormField>

                <FormField label="Relationship">
                  <TextInput
                    style={styles.input}
                    value={contactRelation}
                    onChangeText={setContactRelation}
                    placeholder="e.g. Spouse, Uncle, Guardian"
                  />
                </FormField>

                <FormField label="Phone Number">
                  <TextInput
                    style={styles.input}
                    value={contactPhone}
                    onChangeText={setContactPhone}
                    placeholder="e.g. 9876543211"
                    keyboardType="phone-pad"
                  />
                </FormField>

                <View style={styles.formActions}>
                  <Button
                    title="Cancel"
                    variant="secondary"
                    onPress={() => setShowContactForm(false)}
                    style={styles.formBtn}
                  />
                  <Button title="Save" onPress={handleSaveContact} style={styles.formBtn} />
                </View>
              </View>
            ) : null}

            {/* List of Contacts */}
            <View style={styles.contactsList}>
              {emergencyContacts.map((contact, index) => (
                <View key={index} style={styles.contactItem}>
                  <View style={styles.contactMeta}>
                    <Text style={styles.contactName}>{contact.name}</Text>
                    <Text style={styles.contactRelation}>
                      {contact.relationship} • {contact.phone}
                    </Text>
                  </View>
                  <View style={styles.contactActions}>
                    <Pressable
                      onPress={() => handleOpenContactForm(index)}
                      style={styles.actionIcon}
                      hitSlop={8}
                    >
                      <FontAwesome name="edit" size={16} color={AppTheme.accent} />
                    </Pressable>
                    <Pressable
                      onPress={() => handleDeleteContact(index)}
                      style={styles.actionIcon}
                      hitSlop={8}
                    >
                      <FontAwesome name="trash" size={16} color={AppTheme.danger} />
                    </Pressable>
                  </View>
                </View>
              ))}

              {emergencyContacts.length === 0 ? (
                <Text style={styles.emptyText}>No emergency contacts added yet.</Text>
              ) : null}
            </View>
          </Card>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  leftCol: {
    flex: 1.2,
    minWidth: 320,
  },
  rightCol: {
    flex: 1,
    minWidth: 300,
  },
  card: {
    padding: 20,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: AppTheme.text,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: AppTheme.textMuted,
    textTransform: 'uppercase',
    marginBottom: 8,
    marginTop: 10,
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderColor: AppTheme.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: AppTheme.text,
  },
  disabledInput: {
    backgroundColor: '#f1f5f9',
    color: AppTheme.textMuted,
  },
  textArea: {
    height: 70,
    textAlignVertical: 'top',
  },
  childCard: {
    padding: 12,
    marginBottom: 8,
  },
  childHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${AppTheme.primary}12`,
    borderWidth: 1.5,
    borderColor: AppTheme.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: AppTheme.primary,
  },
  childInfo: {
    flex: 1,
    marginLeft: 12,
  },
  childName: {
    fontSize: 15,
    fontWeight: '700',
    color: AppTheme.text,
  },
  childMeta: {
    fontSize: 11,
    color: AppTheme.textMuted,
    marginTop: 2,
  },
  statusBadge: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  contactsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: AppTheme.accent,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 4,
  },
  addBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: AppTheme.accent,
  },
  contactForm: {
    backgroundColor: AppTheme.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: AppTheme.border,
  },
  contactFormTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: AppTheme.text,
    marginBottom: 12,
  },
  formActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  formBtn: {
    flex: 1,
  },
  contactsList: {
    gap: 10,
  },
  contactItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.border,
  },
  contactMeta: {
    flex: 1,
  },
  contactName: {
    fontSize: 14,
    fontWeight: '600',
    color: AppTheme.text,
  },
  contactRelation: {
    fontSize: 12,
    color: AppTheme.textMuted,
    marginTop: 2,
  },
  contactActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionIcon: {
    padding: 4,
  },
  emptyText: {
    color: AppTheme.textMuted,
    fontSize: 13,
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 12,
  },
});
