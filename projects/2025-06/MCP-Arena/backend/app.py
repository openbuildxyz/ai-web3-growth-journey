from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__)
CORS(app)

# 内存存储模拟数据库
services_db = {}
stake_records = {}

class Service:
    def __init__(self, service_id, name, endpoint, category, description):
        self.id = service_id
        self.name = name
        self.endpoint = endpoint
        self.category = category
        self.description = description
        self.rating = 0.0
        self.qos = 0.0
        self.sla = 0.0
        self.stake_amount = 0.0
        self.created_at = datetime.now()

# 服务注册接口
@app.route('/services', methods=['POST'])
def create_service():
    data = request.json
    service_id = f'svc_{len(services_db)+1}'
    
    new_service = Service(
        service_id=service_id,
        name=data['name'],
        endpoint=data['endpoint'],
        category=data['category'],
        description=data['description']
    )
    
    services_db[service_id] = new_service
    return jsonify({
        'serviceID': service_id,
        'message': 'Service created successfully'
    }), 201

# 服务列表查询接口
@app.route('/services', methods=['GET'])
def get_services():
    category_filter = request.args.get('category')
    
    filtered_services = [
        {
            'serviceID': s.id,
            'name': s.name,
            'endpoint': s.endpoint,
            'category': s.category,
            'rating': s.rating,
            'qos': s.qos,
            'sla': s.sla,
            'stakeAmount': s.stake_amount
        } for s in services_db.values() 
        if not category_filter or s.category == category_filter
    ]
    
    return jsonify({'services': filtered_services})

# 服务调用接口
@app.route('/services/<service_id>/call', methods=['POST'])
def call_service(service_id):
    # 模拟服务调用逻辑
    return jsonify({
        'result': 'success',
        'metadata': {
            'latency': 150,
            'cost': 0.5,
            'timestamp': datetime.now().isoformat()
        }
    })

# 服务详情接口
@app.route('/services/<service_id>', methods=['GET'])
def get_service_details(service_id):
    service = services_db.get(service_id)
    if not service:
        return jsonify({'error': 'Service not found'}), 404
    
    return jsonify({
        'serviceID': service.id,
        'name': service.name,
        'stakeAmount': service.stake_amount,
        'totalRevenue': 1500.00,
        'dailyRevenue': 85.50
    })

# 质押接口
@app.route('/stake', methods=['POST'])
def stake_service():
    data = request.json
    service_id = data['serviceID']
    
    if service_id not in services_db:
        return jsonify({'error': 'Service not found'}), 404
    
    stake_records[service_id] = {
        'amount': data['amount'],
        'timestamp': datetime.now().isoformat()
    }
    services_db[service_id].stake_amount += data['amount']
    
    return jsonify({'message': 'Stake successful'})

# 服务广场展示接口
@app.route('/services/<service_id>/square', methods=['GET'])
def service_square(service_id):
    tab = request.args.get('tab', 'rewards')
    
    # 模拟数据
    records = [
        {
            'type': 'reward',
            'amount': 120.50,
            'timestamp': '2024-03-15T08:30:00'
        } if tab == 'rewards' else {
            'type': 'slash',
            'amount': 50.00,
            'timestamp': '2024-03-14T16:45:00'
        }
    ]
    
    return jsonify({
        'rewardRecords': records,
        'totalRevenue': 1500.00,
        'dailyRevenue': 120.50
    })

if __name__ == '__main__':
    app.run(port=5000, debug=True)