from flask import Flask, request, jsonify
from flask_cors import CORS
import bcrypt
import os
import json
from datetime import datetime

app = Flask(__name__)
CORS(app, origins=['*'])  # 允许所有跨域请求

# 数据存储文件
DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')
USERS_FILE = os.path.join(DATA_DIR, 'users.json')
INCOME_RECORDS_FILE = os.path.join(DATA_DIR, 'income_records.json')
INVESTMENT_RECORDS_FILE = os.path.join(DATA_DIR, 'investment_records.json')

# 确保数据目录存在
os.makedirs(DATA_DIR, exist_ok=True)

# 初始化数据文件
def init_data_files():
    if not os.path.exists(USERS_FILE):
        with open(USERS_FILE, 'w', encoding='utf-8') as f:
            json.dump({}, f)
    if not os.path.exists(INCOME_RECORDS_FILE):
        with open(INCOME_RECORDS_FILE, 'w', encoding='utf-8') as f:
            json.dump({}, f)
    if not os.path.exists(INVESTMENT_RECORDS_FILE):
        with open(INVESTMENT_RECORDS_FILE, 'w', encoding='utf-8') as f:
            json.dump({}, f)

init_data_files()

# 读取数据
def read_data(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        return json.load(f)

# 写入数据
def write_data(file_path, data):
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

# 健康检查
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok', 'message': 'Backend service is running'}), 200

# 用户注册
@app.route('/api/auth/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return jsonify({'error': '用户名和密码不能为空'}), 400
        
        # 读取用户数据
        users = read_data(USERS_FILE)
        
        # 检查用户名是否已存在
        for user_id, user in users.items():
            if user['username'] == username:
                return jsonify({'error': '用户名已存在'}), 400
        
        # 加密密码
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        
        # 创建新用户
        user_id = str(len(users) + 1)
        users[user_id] = {
            'id': user_id,
            'username': username,
            'password': hashed_password.decode('utf-8'),
            'created_at': datetime.utcnow().isoformat()
        }
        
        # 保存用户数据
        write_data(USERS_FILE, users)
        
        return jsonify({
            'message': '注册成功',
            'user': {
                'id': user_id,
                'username': username
            }
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 用户登录
@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return jsonify({'error': '用户名和密码不能为空'}), 400
        
        # 读取用户数据
        users = read_data(USERS_FILE)
        
        # 查找用户
        user = None
        for user_id, user_data in users.items():
            if user_data['username'] == username:
                user = user_data
                break
        
        if not user:
            return jsonify({'error': '用户名或密码错误'}), 401
        
        # 验证密码
        if not bcrypt.checkpw(password.encode('utf-8'), user['password'].encode('utf-8')):
            return jsonify({'error': '用户名或密码错误'}), 401
        
        return jsonify({
            'message': '登录成功',
            'user': {
                'id': user['id'],
                'username': user['username']
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 获取收益记录
@app.route('/api/income-records/<user_id>', methods=['GET'])
def get_income_records(user_id):
    try:
        # 读取收益记录
        all_records = read_data(INCOME_RECORDS_FILE)
        user_records = []
        
        for record_id, record in all_records.items():
            if record['user_id'] == user_id:
                user_records.append({
                    '_id': record_id,
                    'user_id': record['user_id'],
                    'date': record['date'],
                    'amount': record['amount'],
                    'channel': record['channel'],
                    'note': record.get('note', '')
                })
        
        return jsonify(user_records), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 添加收益记录
@app.route('/api/income-records', methods=['POST'])
def add_income_record():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        
        if not user_id:
            return jsonify({'error': '用户ID不能为空'}), 400
        
        # 读取现有记录
        all_records = read_data(INCOME_RECORDS_FILE)
        
        # 创建新记录
        record_id = str(len(all_records) + 1)
        new_record = {
            'user_id': user_id,
            'date': data.get('date'),
            'amount': data.get('amount'),
            'channel': data.get('channel'),
            'note': data.get('note', '')
        }
        
        all_records[record_id] = new_record
        
        # 保存记录
        write_data(INCOME_RECORDS_FILE, all_records)
        
        return jsonify({
            '_id': record_id,
            **new_record
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 更新收益记录
@app.route('/api/income-records/<record_id>', methods=['PUT'])
def update_income_record(record_id):
    try:
        data = request.get_json()
        
        # 读取现有记录
        all_records = read_data(INCOME_RECORDS_FILE)
        
        # 检查记录是否存在
        if record_id not in all_records:
            return jsonify({'error': '记录不存在'}), 404
        
        # 更新记录
        all_records[record_id].update({
            'date': data.get('date'),
            'amount': data.get('amount'),
            'channel': data.get('channel'),
            'note': data.get('note', '')
        })
        
        # 保存记录
        write_data(INCOME_RECORDS_FILE, all_records)
        
        return jsonify({
            '_id': record_id,
            **all_records[record_id]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 删除收益记录
@app.route('/api/income-records/<record_id>', methods=['DELETE'])
def delete_income_record(record_id):
    try:
        # 读取现有记录
        all_records = read_data(INCOME_RECORDS_FILE)
        
        # 检查记录是否存在
        if record_id not in all_records:
            return jsonify({'error': '记录不存在'}), 404
        
        # 删除记录
        del all_records[record_id]
        
        # 保存记录
        write_data(INCOME_RECORDS_FILE, all_records)
        
        return jsonify({'message': '记录删除成功'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 获取投资记录
@app.route('/api/investment-records/<user_id>', methods=['GET'])
def get_investment_records(user_id):
    try:
        # 读取投资记录
        all_records = read_data(INVESTMENT_RECORDS_FILE)
        user_records = []
        
        for record_id, record in all_records.items():
            if record['user_id'] == user_id:
                user_records.append({
                    '_id': record_id,
                    'user_id': record['user_id'],
                    'date': record['date'],
                    'channel': record['channel'],
                    'amount': record['amount'],
                    'newTotal': record['newTotal']
                })
        
        return jsonify(user_records), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 添加投资记录
@app.route('/api/investment-records', methods=['POST'])
def add_investment_record():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        
        if not user_id:
            return jsonify({'error': '用户ID不能为空'}), 400
        
        # 读取现有记录
        all_records = read_data(INVESTMENT_RECORDS_FILE)
        
        # 创建新记录
        record_id = str(len(all_records) + 1)
        new_record = {
            'user_id': user_id,
            'date': data.get('date'),
            'channel': data.get('channel'),
            'amount': data.get('amount'),
            'newTotal': data.get('newTotal')
        }
        
        all_records[record_id] = new_record
        
        # 保存记录
        write_data(INVESTMENT_RECORDS_FILE, all_records)
        
        return jsonify({
            '_id': record_id,
            **new_record
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 删除投资记录
@app.route('/api/investment-records/<record_id>', methods=['DELETE'])
def delete_investment_record(record_id):
    try:
        # 读取现有记录
        all_records = read_data(INVESTMENT_RECORDS_FILE)
        
        # 检查记录是否存在
        if record_id not in all_records:
            return jsonify({'error': '记录不存在'}), 404
        
        # 删除记录
        del all_records[record_id]
        
        # 保存记录
        write_data(INVESTMENT_RECORDS_FILE, all_records)
        
        return jsonify({'message': '记录删除成功'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)