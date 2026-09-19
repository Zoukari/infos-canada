# 🇨🇦 Infos Canada

> Toute l'actualité utile du Canada, au même endroit.

Application Next.js complète pour centraliser automatiquement les informations importantes sur le Canada, avec une priorité forte sur le **Nouveau-Brunswick**.

---

## 🚀 Déploiement rapide

### 1. Base de données

Créez une base PostgreSQL sur **Supabase** (gratuit) ou **Neon** :

- Supabase : https://supabase.com → New project → PostgreSQL
- Neon : https://neon.tech → Free tier disponible

Copiez l'URL de connexion.

### 2. Variables d'environnement

Copiez `.env.example` → `.env.local` et remplissez :

```bash
DATABASE_URL="postgresql://user:pass@host:5432/infos_canada"
ADMIN_SECRET="votre-cle-secrete-longue"
CRON_SECRET="autre-cle-pour-les-crons"
NEXT_PUBLIC_SITE_URL="https://votre-domaine.vercel.app"
```

### 3. Base de données — initialisation

```bash
npm install
npx prisma db push        # Crée les tables
npm run db:seed           # Peuple les catégories et sources RSS
```

### 4. Déploiement Vercel

```bash
npm install -g vercel
vercel --prod
```

Ajoutez les mêmes variables dans le tableau de bord Vercel.

---

## ⚙️ Collecte automatique

### Vercel Cron (inclus dans `vercel.json`)

Collecte automatique à **6h, 12h et 18h** (heure UTC). Configurez `CRON_SECRET` sur Vercel.

### Manuel via l'administration

1. Ouvrez `/admin`
2. Entrez votre `ADMIN_SECRET`
3. Cliquez **Lancer la collecte**

---

## 📁 Structure du projet

```
infos-canada/
├── app/
│   ├── page.tsx                    # Homepage
│   ├── nouveau-brunswick/page.tsx  # Page NB
│   ├── immigration/page.tsx        # Immigration
│   ├── emploi/page.tsx             # Emploi
│   ├── logement/page.tsx           # Logement
│   ├── politique/page.tsx          # Politique
│   ├── economie/page.tsx           # Économie
│   ├── sante/page.tsx              # Santé
│   ├── canada/page.tsx             # Canada
│   ├── a-surveiller/page.tsx       # À surveiller
│   ├── recherche/page.tsx          # Recherche
│   ├── article/[slug]/page.tsx     # Article individuel
│   ├── admin/page.tsx              # Administration
│   └── api/
│       ├── articles/               # GET articles (filtres, search)
│       ├── watch/                  # GET éléments à surveiller
│       ├── categories/             # GET catégories
│       ├── admin/scrape/           # POST lancer collecte
│       ├── admin/stats/            # GET statistiques
│       ├── admin/sources/          # CRUD sources
│       └── cron/daily/             # GET déclencheur cron
├── components/
│   ├── Header.tsx                  # Navigation sticky + recherche
│   ├── Footer.tsx                  # Pied de page
│   └── ArticleCard.tsx             # Carte article (3 tailles)
├── lib/
│   ├── prisma.ts                   # Client Prisma singleton
│   ├── scraper.ts                  # Moteur RSS + détection catégorie
│   └── sources.ts                  # Sources et catégories initiales
├── prisma/
│   ├── schema.prisma               # Modèle de données
│   └── seed.ts                     # Données initiales
└── vercel.json                     # Cron jobs (3×/jour)
```

---

## 🗄️ Modèles de données

| Modèle | Description |
|--------|-------------|
| `Source` | Sources RSS/API (nom, URL, province, catégorie) |
| `Article` | Articles collectés (titre, résumé, importance, province) |
| `Category` | Catégories (NB et Canada fédéral) |
| `WatchItem` | Éléments à surveiller (tirages, lois, dates) |
| `ScrapingLog` | Logs de collecte (succès/erreur) |
| `DailyDigest` | Résumé quotidien |
| `AdminUser` | Utilisateurs admin |

---

## 🔌 Sources RSS configurées

**Gouvernement & officiel :**
- Canada.ca (nouvelles)
- IRCC (Immigration)
- Statistique Canada
- Banque du Canada
- Gouvernement du Nouveau-Brunswick
- Ville de Moncton, Fredericton

**Médias :**
- Radio-Canada NB et Canada
- CBC New Brunswick et Canada
- Le Devoir
- Immigrer.com

---

## 📊 Catégories (35+)

### Nouveau-Brunswick
Gouvernement, Immigration, NBPNP, Emploi, Logement, Santé, Éducation, Économie, Moncton, Dieppe, Fredericton, Saint John, Edmundston, Actualités locales

### Canada fédéral
Gouvernement, Politique, Immigration, Entrée express, Francophonie, Résidence permanente, Permis de travail/études, Citoyenneté, Économie, Emploi, Logement, Santé, Taux d'intérêt, Inflation, Fiscalité

---

## 🛠️ Ajouter une source RSS

Via l'interface admin `/admin` → onglet Sources → **+ Ajouter une source**

Ou directement via l'API :
```bash
curl -X POST /api/admin/sources \
  -H "x-admin-secret: VOTRE_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"name":"Ma Source","url":"https://exemple.ca","rssUrl":"https://exemple.ca/feed.xml","type":"rss","province":"NB","defaultCategory":"actualites-nb"}'
```

---

## ⚡ Endpoints API

```
GET  /api/articles                 Articles (filtres: province, category, city, search, limit, page)
GET  /api/articles/latest          10 articles les plus importants
GET  /api/articles/new-brunswick   Articles du NB
GET  /api/articles/immigration     Articles immigration
GET  /api/watch                    Éléments à surveiller
GET  /api/categories               Toutes les catégories
POST /api/admin/scrape             Lancer collecte (header: x-admin-secret)
GET  /api/admin/stats              Statistiques (header: x-admin-secret)
GET  /api/admin/sources            Liste sources (header: x-admin-secret)
POST /api/admin/sources            Créer source
PATCH /api/admin/sources           Modifier source
DELETE /api/admin/sources          Supprimer source
GET  /api/cron/daily               Déclencheur cron (header: Authorization Bearer)
```

---

## 🤖 Principes de collecte

- RSS et APIs officielles en priorité absolue
- Respect des `robots.txt` et conditions d'utilisation
- Délai de 1,5s entre chaque requête
- Déduplication par URL unique et hash de contenu
- Détection automatique : province, ville, catégorie, score d'importance
- Résumés automatiques générés depuis le contenu RSS
- Aucune information inventée — uniquement ce qui est dans la source

---

## 📝 Licence

Projet privé — sources citées et liens vers originaux systématiquement inclus.
