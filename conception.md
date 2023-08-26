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
    - Désactiver les autres boutons d'action vers les personnes bloquées. [v]
    - Remettre l'UI pour les personnes non-bloquées quand l'utilisateur débloque une personne [v]
    - Désactiver le bouton d'envoi de message vers les personnes bloquées dans le client [v] et le serveur [v] (A       chaque envoi de message, il faut toujours vérifier que le destinaire n'est pas bloqué. Ceci pour prévenir d'une quelconque tentatives de la part de certains utilisateurs) [v]
    - Afficher les erreurs de connexion et d'inscription [v]
    - Ajouter le menu déroulant [v]
    - Ajouter la déconnexion [v]
    - Ajouter un opérateur "OR" dans le where sql. Ceci pour resoudre l'erreur "undefined sender_id" car on n'a fait que récupérer le message envoyé par l'utilisateur courant. Parfois l'utilisateur courant n'a pas encore envoyé de message d'autant plus qu'on devait récuperer le dernier message de la
    conversation. [v]
    - Régler le bug "doublon de message" [v]
    - Ajouter nodemon [v]
    - Finir l'étape 3 d'inscription
    - Ajouter l'oeil sur les inputs de mot de passe avec la possibilié de voir les MDP
    - Ajouter l'animation au congratsForSubscription
    - Regler l'heure des messages
    - Suppression des messages
    - Ajouter le support d'amojis 
    - Recherche de conversation
    - Refaire une récupération via le websocket lors du retour après la création de conversation
    - Ajouter le statut en ligne de l'utilisateur dans le BDD lorsqu'il se connecte
    - Liste d'amis et leur statut en ligne
    - Envoi d'images
    - Envoi de fichiers
    - Vocal
    - Appel vidéo
    

# FONCTIONNALITES A AJOUTER
    - Support d'emojis
    