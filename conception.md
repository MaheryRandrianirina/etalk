# A FAIRE
    * INSCRIPTION
        - Finir l'étape 3
        - Ajouter l'animation au congratsForSubscription
    * CONVERSATION
        A. Faire le header de la conversation
            - Appui sur retour [v]
            - Voir le profil

        B. Faire le footer de la conversation
            - Envoi de texto [v]
            - Envoi d'images
            - Envoi de fichiers
            - Support d'emojis
            - Vocal
            - Appel vidéo
        C. Faire le content de la conversation
            - Affichage des messages avec l'heure[v]
            - Suppression des messages
            - Afficher 10 derniers messages
            - Charger 10 autres messages quand l'utilisateur a scrollé jusqu'au premier message chargé

# PROCHAINES ACTIONS A FAIRE
    - Deplacer DateHelper (L'enlever du dossier Backedn) [v]
    - Styliser la bulle de message juste au moment de l'envoi [v]
    - Implementer la véritable logique du blocage d'utilisateur dans le fichier block [v]
    - Dès le chargement de la conversation, faire une requête pour savoir si le
        destinataire est bloqué ou non. Si oui, ajouter la classe "blocked" dans user_converstion [v]
    - Voir le profil [v]
    - Remettre l'UI pour les personnes non-bloquées quand l'utilisateur débloque une personne [v]
    - Désactiver le bouton d'envoi de message vers les personnes bloquées dans le client [v] et le serveur [v] (A       chaque envoi de message, il faut toujours vérifier que le destinaire n'est pas bloqué. Ceci pour prévenir d'une quelconque tentatives de la part de certains utilisateurs)
    - Modifier les colonnes liées à conversation_id afin de les supprimer lorsque ce dette dernière a été supprimée
    (Ajouter un ON DELETE CASCADE)
    - Regler l'heure des messages
    - Ajouter le menu déroulant
    - Ajouter la déconnexion
    - Refaire une récupération via le websocket lors du retour après la création de conversation
    - Envoi d'images
    - Envoi de fichiers
    - Désactiver les autres boutons d'action pour vers les personnes bloquées.
    - Suppression des messages
    - Recherche sur l'ajout de support d'emojis dans les applis web
    - Ajouter le support d'amojis
    - Recherche de conversation
    - Liste d'amis et leur statut en ligne
    - Déconnexion
    - Finir l'étape 3
    - Ajouter l'animation au congratsForSubscription
    - Vocal
    - Appel vidéo
    

# FONCTIONNALITES A AJOUTER
    - Support d'emojis
    