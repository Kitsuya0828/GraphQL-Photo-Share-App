// apollo-serverモジュールを読み込む
const { ApolloServer } = require(`apollo-server`)

const typeDefs = `

    # 列挙型
    enum PhotoCategory {
        SELFIE
        PORTRAIT
        ACTION
        LANDSCAPE
        GRAPHIC
    }
    
    # Photo型の定義
    type Photo {
        id: ID!
        url: String!
        name: String!
        description: String
        category: PhotoCategory!
        postedBy: User!
    }

    # 入力型（categoryフィールドを指定しない場合はデフォルトでPORTRAIT）
    input PostPhotoInput {
        name: String!
        category: PhotoCategory=PORTRAIT
        description: String
    }

    # allPhotosはPhoto型のリストを返す
    type Query {
        totalPhotos: Int!
        allPhotos: [Photo!]!
    }

    # ミューテーションによって新たに投稿されたPhotoを返す
    type Mutation {
        postPhoto(input: PostPhotoInput!): Photo!
    }

    type User {
        githubLogin: ID!
        name: String
        avatar: String
        postedPhotos: [Photo!]!
    }
`

// ユニークIDをインクリメントするための変数
let _id = 0

// 写真を格納するための配列
// let photos = []

let users = [
    {"githubLogin": "mHattrup", "name": "Mike Hattrup"},
    {"githubLogin": "gPlake", "name": "Glen Plake"},
    {"githubLogin": "sSchmidt", "name": "Scot Schmidt"},
]

let photos = [
    {
        "id": "1",
        "name": "Dropping the Heart Chute",
        "description": "The heart chute is one of my favorite chutes",
        "category": "ACTION",
        "githubUser": "gPlake"
    },
    {
        "id": "2",
        "name": "Enjoying the sunshine",
        "category": "SELFIE",
        "githubUser": "sSchmidt"
    }, 
    {
        "id": "3",
        "name": "Gunbarrel 25",
        "description": "25 laps on gunbarrel today",
        "category": "LANDSCAPE",
        "githubUser": "sSchmidt"
    },
]

const resolvers = {
    Query: {

        // 写真を格納した配列の長さを返す
        totalPhotos: () => photos.length,
        
        // 写真を格納した配列を返す
        allPhotos: () => photos
    },

    // postPhotoミューテーションと対応するリゾルバ
    Mutation: {
        postPhoto(parent, args) {

            // 新しい写真を作成し，idを生成する
            var newPhoto = {
                id: _id++,
                ...args.input
            }
            photos.push(newPhoto)

            // 新しい写真を返す
            return newPhoto
        }
    },

    Photo: {
        url: parent => `http://yoursite.com/img/${parent.id}.jpg`,
        postedBy: parent => {
            return users.find(u => u.githubLogin === parent.githubUser)
        }
    },
    User: {
        postedPhotos: parent => {
            return photos.filter(p => p.githubUser === parent.githubLogin)
        }
    }
}

// サーバーのインスタンスを作成
// typeDefs（スキーマ）とリゾルバを引数に取る
const server = new ApolloServer({
    typeDefs,
    resolvers
})

// Webサーバーを起動
server.listen().then(({url}) => console.log(`GraphQL Service running on ${url}`))