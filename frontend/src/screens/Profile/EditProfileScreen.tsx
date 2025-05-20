import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Icon from 'react-native-vector-icons/Ionicons';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import authService from '../../services/auth';
import { User } from '../../services/auth';

interface EditProfileScreenProps {
  navigation: any;
  route: any;
}

const DEFAULT_AVATAR = { uri: 'https://via.placeholder.com/150' };

const EditProfileScreen: React.FC<EditProfileScreenProps> = ({ navigation, route }) => {
  const user = route.params?.user as User;
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState(user.username);
  const [profilePicture, setProfilePicture] = useState<string | null>(user.profilePicture || null);
  const [errors, setErrors] = useState<{ username?: string }>({});

  const validateForm = () => {
    const newErrors: { username?: string } = {};

    if (!username.trim()) {
      newErrors.username = 'Le nom d\'utilisateur est requis';
    } else if (username.length < 3) {
      newErrors.username = 'Le nom d\'utilisateur doit contenir au moins 3 caractères';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission requise',
          'Veuillez autoriser l\'accès à votre galerie pour changer votre photo de profil.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setProfilePicture(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Erreur lors de la sélection de l\'image:', error);
      Alert.alert('Erreur', 'Impossible de sélectionner l\'image');
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      const updatedUser = await authService.updateProfile({
        username: username.trim(),
        profilePicture: profilePicture,
      });

      Alert.alert(
        'Succès',
        'Votre profil a été mis à jour avec succès',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      Alert.alert('Erreur', 'Impossible de mettre à jour votre profil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.profileImageContainer}
          onPress={pickImage}
        >
          <Image
            source={
              profilePicture
                ? { uri: profilePicture }
                : DEFAULT_AVATAR
            }
            style={styles.profileImage}
          />
          <View style={styles.editIconContainer}>
            <Icon name="camera" size={20} color="#FFF" />
          </View>
        </TouchableOpacity>
        <Text style={styles.editPhotoText}>Modifier la photo</Text>
      </View>

      <View style={styles.form}>
        <Input
          label="Nom d'utilisateur"
          value={username}
          onChangeText={setUsername}
          placeholder="Votre nom d'utilisateur"
          error={errors.username}
        />

        <Button
          title="Enregistrer les modifications"
          onPress={handleSave}
          loading={loading}
          style={styles.saveButton}
        />

        <Button
          title="Annuler"
          onPress={() => navigation.goBack()}
          variant="outline"
          style={styles.cancelButton}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#007AFF',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFF',
  },
  editPhotoText: {
    fontSize: 16,
    color: '#007AFF',
    marginTop: 8,
  },
  form: {
    padding: 20,
  },
  saveButton: {
    marginTop: 20,
  },
  cancelButton: {
    marginTop: 12,
  },
});

export default EditProfileScreen; 