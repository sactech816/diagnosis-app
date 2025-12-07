import { NextResponse } from 'next/server';
import { Client } from 'basic-ftp';

export async function POST(request) {
    let client = null;
    try {
        const { htmlContent, filename } = await request.json();

        if (!htmlContent || !filename) {
            return NextResponse.json(
                { error: 'HTMLコンテンツとファイル名が必要です' },
                { status: 400 }
            );
        }

        // 環境変数からエックスサーバの設定を取得
        const ftpConfig = {
            host: process.env.XSERVER_FTP_HOST,
            port: parseInt(process.env.XSERVER_FTP_PORT || '21'), // FTPは21
            username: process.env.XSERVER_FTP_USERNAME,
            password: process.env.XSERVER_FTP_PASSWORD,
        };

        // 必須設定のチェック（設定されていない場合はスキップ）
        if (!ftpConfig.host || !ftpConfig.username || !ftpConfig.password) {
            return NextResponse.json(
                { 
                    success: false, 
                    skipped: true,
                    message: 'エックスサーバの設定が不完全です。環境変数が設定されていないため、アップロードをスキップしました。' 
                },
                { status: 200 } // エラーではなく、スキップされたことを示す
            );
        }

        // FTPクライアントを作成
        client = new Client();
        client.ftp.verbose = true; // デバッグ用（本番環境ではfalse推奨）

        // エックスサーバに接続
        await client.access({
            host: ftpConfig.host,
            user: ftpConfig.username,
            password: ftpConfig.password,
            port: ftpConfig.port,
            secure: false, // FTPは暗号化されていない
        });

        // アップロード先のディレクトリ（環境変数から取得、デフォルトはpublic_html/quizzes）
        const remotePath = process.env.XSERVER_UPLOAD_PATH || '/public_html/quizzes';
        
        // ディレクトリが存在しない場合は作成
        try {
            await client.ensureDir(remotePath);
        } catch (e) {
            // ディレクトリが既に存在する場合は無視
            console.log('ディレクトリ確認:', e.message);
        }

        // HTMLファイルをアップロード
        const buffer = Buffer.from(htmlContent, 'utf-8');
        await client.uploadFrom(buffer, `${remotePath}/${filename}`);

        // ベースURLを構築（環境変数から取得）
        const baseUrl = process.env.XSERVER_BASE_URL || '';
        const fileUrl = baseUrl ? `${baseUrl}/quizzes/${filename}` : `quizzes/${filename}`;

        return NextResponse.json({
            success: true,
            message: 'HTMLファイルをエックスサーバにアップロードしました',
            url: fileUrl
        });

    } catch (error) {
        console.error('アップロードエラー:', error);
        return NextResponse.json(
            { error: 'アップロードに失敗しました: ' + error.message },
            { status: 500 }
        );
    } finally {
        // 接続を確実に閉じる
        if (client) {
            try {
                await client.close();
            } catch (e) {
                console.error('FTP接続のクローズエラー:', e);
            }
        }
    }
}
